package jamie;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.*;
import java.net.http.HttpClient;
import java.util.HashMap;
import java.util.List;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.ArrayList;

import org.json.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;

record PriceChangeToday(String timestamp, double runningTotal) {};

public class HttpServer {
    public HttpClient client;
    public String oldest_pos;
    public DataCollector data;

    private final ObjectMapper mapper = new ObjectMapper();

    Database db;

    public HttpServer(HttpClient client) {
        this.client = client;
        this.data = new DataCollector(client);
        this.db = new Database();
    }

    public void initialise() {

        try{
            ServerSocket server = new ServerSocket(8080);
            ExecutorService pool = Executors.newFixedThreadPool(10);

            boolean running = true;
            while (running) {
                Socket socket = server.accept();

                pool.submit(() -> {
                    try {
                        handleRequest(socket);
                    } catch (Exception e) {
                        System.out.println(e);
                    }
                });

            }

            server.close();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    public void handleRequest(Socket socket) {
        try (socket) {
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(socket.getInputStream())
            );

            ArrayList<String> full_response = new ArrayList<String>();
            String current_line;
            while ((current_line = reader.readLine()) != null && !current_line.isEmpty()) {
                full_response.add(current_line);
            }

            int contentLength = 0;

            String cookie ="";
            for (String header : full_response) {
                if (header.toLowerCase().startsWith("content-length:")) {
                    contentLength = Integer.parseInt(
                        header.substring("content-length:".length()).trim()
                    );
                }

                if (header.toLowerCase().startsWith("cookie:")) {
                    cookie = header.substring("cookie:".length()).trim();
                }
            }

            char[] body = new char[contentLength];
            reader.read(body, 0, contentLength);

            String requestBody = new String(body);

            cookie = getSessionIDFromCookie(cookie);
            Request request = parse(full_response.get(0), requestBody, cookie);

            System.out.println("Request: " + request);
            System.out.println("Body: " + requestBody);
            System.out.println();

            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()))) {
                route(request, writer);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void route(Request request, BufferedWriter writer) throws Exception {
        if (request.requestType().equals("OPTIONS")) {
            Responder.handleOptionsRequest(writer);
            return;
        }

        if (request.requestType.equals("GET")) {
            handleGetRequest(request, writer);
        } else if (request.requestType.equals("POST")) {
            handlePostRequest(request, writer);
        }

    }

    public void handlePostRequest(Request request, BufferedWriter writer) throws Exception {
        String cookie = request.cookie;
        String user_id = this.db.getUserIDFromSession(cookie);

        String path = request.path;
        if (path.startsWith("/api")) {
            path = path.substring(4);
        }

        JSONObject body = new JSONObject(request.body);

        String email;
        String password;

        switch (path) {
            case "/login":
                email = body.getString("email");
                password = body.getString("password");

                loginUser(email, password, writer);

                break;

            case "/logout":
                if (!cookie.isEmpty()) {
                    this.db.deleteSessionsWithSessionID(cookie);
                    Responder.writeLogoutResponse("Logging out user: " + cookie, writer);
                } else {
                    Responder.writeErrorResponse("No cookie exists for: " + cookie, writer);
                }

                break;

            case "/register":
                email = body.getString("email");
                password = body.getString("password");

                boolean createdUser = this.db.createUser(email, password);

                if (createdUser) {
                    loginUser(email, password, writer);
                } else {
                    Responder.writeErrorResponse("Error: Users already exists?", writer);
                }

                break;

            case "/editAccountSettings":
                email = body.getString("email");
                password = body.getString("password");
                String confirm_password = body.getString("confirm_password");

                System.out.println("Editing email and password " +  email + password);

                boolean[] editedUser = this.db.editUserEmailOrPassword(user_id, email, password, confirm_password);

                System.out.println("edited users: " + editedUser);

                if (editedUser[0] && editedUser[1]) {
                    Responder.writeResponse("Successfully changed email and password", writer);
                } else if (editedUser[0] && !editedUser[1]) {
                    Responder.writeResponse("Only changed email", writer);
                } else if (!editedUser[0] && editedUser[1]) {
                    Responder.writeResponse("Only changed password", writer);
                } else {
                    Responder.writeErrorResponse("Unable to change email and password", writer);
                }

                break;

            case "/addTradingKeys":
                String publicKey = body.getString("publicKey");
                String privateKey = body.getString("privateKey");

                String tradingKeyUUID = this.db.createTradingKey(publicKey, privateKey, user_id);

                if (!tradingKeyUUID.isEmpty()) {
                    Responder.writeResponse("Keys Added!", writer);
                } else {
                    Responder.writeErrorResponse("Error: Trading Key could not be created.", writer);
                }

                break;

            case "/togglePrivacyMode":
                System.out.println("Toggling privacy setting");
                boolean toggledPrivacyMode = this.db.togglePrivacyMode(user_id);

                System.out.println("Changed privacy mode: " + toggledPrivacyMode);

                if (toggledPrivacyMode) {
                    Responder.writeResponse("Toggled Privacy Mode", writer);
                } else {
                    Responder.writeErrorResponse("Failed to toggle privacy mode", writer);
                }

                break;

            case "/toggleDarkMode":
                System.out.println("Toggling dark mode setting");
                boolean toggledDarkMode = this.db.toggleDarkMode(user_id);

                System.out.println("Changed dark mode: " + toggledDarkMode);

                if (toggledDarkMode) {
                    Responder.writeResponse("Toggled Dark Mode", writer);
                } else {
                    Responder.writeErrorResponse("Failed to toggle Dark Mode", writer);
                }

                break;


            case "/deleteUser":
                System.out.println("Deleting user: " + user_id);
                boolean deletedUser = this.db.deleteUser(user_id);

                if (deletedUser) {
                    Responder.writeResponse("Successfully deleted user: " + user_id, writer);
                } else {
                    Responder.writeErrorResponse("Could not delete user: " + user_id, writer);
                }

                break;

            default:
                Responder.writeResponse("Error path not recognised: " + path, writer);

                break;
        }
    }

    public String getSessionIDFromCookie(String cookie) {
        if (cookie == null || cookie.isEmpty()) {
            return "";
        }

        for (String part : cookie.split(";")) {
            part = part.trim();

            if (part.startsWith("session_id=")) {
                return part.substring("session_id=".length());
            }
        }

        return "";
    }

    public void loginUser(String email, String password, BufferedWriter writer) throws Exception {
        String loggedIn = this.db.loginUser(email, password);
        System.out.println("logged in: " + loggedIn);

        if (!loggedIn.isEmpty()) {
            this.db.deleteSessionsWithId(loggedIn);
            String session_id = this.db.createSession(loggedIn);

            Responder.writeCookieResponse("Logged in user! " + email + " | " + session_id, session_id, writer);
        } else {
            Responder.writeErrorResponse("Error: User does not exist", writer);
        }

    }

    public void handleGetRequest(Request request, BufferedWriter writer) throws Exception {
        String user_id = this.db.getUserIDFromSession(request.cookie);

        if (user_id.isEmpty()) {
            Responder.writeErrorResponse("Cookie doesnt exist: " + request.cookie, writer);
            return;
        }

        HashMap<String, String> user = this.db.selectFromUsersUsingID(user_id);

        String path = request.path;
        String cacheKey = user_id + request.path;

        String[] tradingKeys = this.db.getTradingKeysWithUserID(user_id);

        List<Position> positions = this.data.getPositions(user_id, tradingKeys);


        // /api/all?range=...&interval=.../...
        String route = path;
        if (path.startsWith("/api")) {
            route = route.substring(4);
        }

        System.out.println("ROUTE: " + route);

        String[] path_levels = route.split("\\/");
        System.out.println("PATH LEVELS: " + Arrays.toString(path_levels));

        // [/all?range=...&interval=..., /...]
        String[] split_path = path_levels[1].split("\\?");
        System.out.println("SPLIT PATH : " + Arrays.toString(split_path));

        // ["/all", "range=...&interval=..."]
        String matching_path = split_path[0];
        System.out.println("MATCHING PATH" + matching_path);
        HashMap<String, String> params = handleParams(split_path);


        // "/all"
        switch (matching_path) {
            case "all":
                List<CombinedPosition> combinedPositionsAll = data.getCombinedPositions(params, positions);

                String json = mapper.writeValueAsString(combinedPositionsAll);

                this.data.cache.addToCache(cacheKey, json);
                Responder.writeResponse(json, writer);
                break;

            case "positions":
                String positionsJson = mapper.writeValueAsString(positions);
                Responder.writeResponse(positionsJson, writer);
                break;

            case "profit-over-time":
                List<CombinedPosition> cps = new ArrayList<>();

                for (Position p : positions) {
                    HashMap<String, String> params_map = new HashMap<>();
                    params_map.put("range", "range=" + p.holdingTime + "d");
                    params_map.put("interval", "interval=1d");

                    YahooPosition yp;

                    try {
                        yp = this.data.getYahooInformation(
                            p.possibleYahooTicker,
                            params_map
                        );

                    } catch (Exception e) {
                        continue;
                    }

                    CombinedPosition cp = new CombinedPosition(p, yp);
                    double runningTotal = p.totalCost;

                    for (TimestampElement te : yp.timestamp_elements) {
                        double priceChangePercentageAbsolute =
                            te.priceChangePercentage / 100;

                        double change = 1 + priceChangePercentageAbsolute;

                        runningTotal *= change;

                        te.profit = runningTotal - p.totalCost;
                    }

                    cps.add(cp);
                }

                String cpsJson = mapper.writeValueAsString(cps);

                this.data.cache.addToCache(cacheKey, cpsJson);

                Responder.writeResponse(cpsJson, writer);


                break;

            case "userDetails":
                HashMap<String, String> userDetails = this.db.selectFromUsersUsingID(user_id);

                String userDetailsJson = new JSONObject(userDetails).toString();

                Responder.writeResponse(userDetailsJson, writer);

                break;

            case "accountSettingsDetails":
                HashMap<String, String> accountSettingsDetails = this.db.getAccountSettingsWithUserID(user_id);

                if (accountSettingsDetails == null) {
                    Responder.writeErrorResponse("No account settings found for user: " + user_id,  writer);
                } else {
                    String accountSettingsDetailsJSON = new JSONObject(accountSettingsDetails).toString();
                    Responder.writeResponse(accountSettingsDetailsJSON, writer);
                }

                break;

            case "database":
                if (path_levels.length < 3) {
                    Responder.writeErrorResponse("Missing a path for database get request.", writer);
                    break;
                }

                if (!user.get("user_type").equals("ADMIN")) {
                    Responder.writeErrorResponse("You do not have admin status to access this data.", writer);
                    break;
                }

                String databaseJSON = handleDatabaseGetRequests(path_levels[2]);

                if (databaseJSON == null) {
                    Responder.writeErrorResponse("No path exists for database data: " + path_levels[2], writer);
                }

                Responder.writeResponse(databaseJSON, writer);

                break;

            default:
                Position pos = findPosition(matching_path, positions);
                if ("holdingTime=true".equals(params.get("holdingTime"))) {
                    params.put("range", "range=" + pos.holdingTimeDaysValue + "d");
                    params.remove("holdingTime");
                }


                if (pos == null || (path_levels.length > 2 && path_levels[1].equals("exact"))) {
                    YahooPosition yp = this.data.getYahooInformation(matching_path, params);
                    CombinedPosition new_cp = new CombinedPosition(null, yp);
                    String new_cp_json = new_cp.toJson();

                    this.data.cache.addToCache(cacheKey, new_cp_json);
                    Responder.writeResponse(new_cp_json, writer);
                    break;
                } else {
                    CombinedPosition new_cp = this.data.getCombinedPosition(pos, params);
                    String new_cp_json = new_cp.toJson();

                    this.data.cache.addToCache(cacheKey, new_cp_json);
                    Responder.writeResponse(new_cp_json, writer);
                    break;
                }
        }

    }

    public String handleDatabaseGetRequests(String path) throws Exception {
        HashMap<String, ArrayList<String>> data;
        switch (path) {
            case "users":
                data = this.db.getAllUserData();
                break;
            case "tradingKeys":
                data = this.db.getAllTradingKeysData();
                break;
            case "sessions":
                data = this.db.getAllSessionData();
                break;
            default:
                data = null;
                break;
        }

        String databaseJSON = new JSONObject(data).toString();
        System.out.println(databaseJSON);

        return databaseJSON;

    }

    public HashMap<String, String> handleParams(String[] split_path) {
        HashMap<String, String> param_details = new HashMap<String, String>();

        if (split_path.length > 1) {
            String params = split_path[1];

            String[] split_params = params.split("\\&");

            for (String param : split_params) {
                String[] split_param = param.split("\\=");
                String paramater = split_param[0];

                param_details.put(paramater, param);
            }

        }
        return param_details;
    }

    public Position findPosition(String ticker, List<Position> positions) {
        for ( Position pos : positions ) {
            if (pos.ticker.contains(ticker)) {

                return pos;
            }
        }
        return null;
    }

    public CombinedPosition linearSearch(String ticker, List<CombinedPosition> combinedPositions) {
        for ( CombinedPosition pos : combinedPositions ) {
            if (pos.position.ticker.contains(ticker)) {
                return pos;
            }
        }
        return null;
    }


    public record Request (String requestType, String path, String body, String cookie) {}

    public Request parse(String request, String body, String cookie) {
        String[] keywords = request.split(" ");
        String requestType = keywords[0];
        String path = keywords[1];

        return new Request(requestType, path, body, cookie);
    }

}


