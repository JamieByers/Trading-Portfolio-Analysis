package jamie;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.*;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.ArrayList;

import org.json.JSONObject;

import com.fasterxml.jackson.databind.ObjectMapper;

public class HttpServer {
    public List<CombinedPosition> combined_positions;
    public List<Position> positions;

    public HttpServer(List<Position> positions) {
        this.positions = positions;
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
        try {
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(socket.getInputStream())
            );

            String line = reader.readLine();
            System.out.println(line);
            // ignore the rest of the request


            BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(socket.getOutputStream()
            ));

            Request request = parse(line);

            if (request.requestType.equals("GET")) {
                route(request.path, writer);
            } else {
                writeResponse("Only GET requests are accepted", writer);
            }

            writer.flush();

            writer.close();
            socket.close();
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    public void route(String path, BufferedWriter writer) throws Exception {
        String[] split_path = path.split("\\?");
        HashMap<String, String> params = handleParams(split_path);
        System.out.println("path"+split_path[0]);
        switch (split_path[0]) {
            case "/coffee":
                writeResponse("Coffee!!!!", writer);
                break;

            case "/all":
                ObjectMapper mapper = new ObjectMapper();
                List<CombinedPosition> combinedPositionsAll = getCombinedPositions(params);
                String json = mapper.writeValueAsString(combinedPositionsAll);

                writeResponse(json.toString(), writer);
                break;

            default:
                // not finding singular stocks
                List<CombinedPosition> combinedPositionsSingle = getCombinedPositions(params);
                CombinedPosition pos = linearSearch(split_path[0].substring(1), combinedPositionsSingle);
                if (pos == null) {
                    writeResponse("Failed to find a position with ticker: " + path, writer);
                    break;
                } else {
                    writeResponse(pos.toJson(), writer);
                    break;
                }
        }
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

    public CombinedPosition linearSearch(String ticker, List<CombinedPosition> combinedPositions) {
        System.out.println("linear searchign " + ticker);
        for ( CombinedPosition pos : combinedPositions ) {
            if (pos.position.ticker.contains(ticker)) {
                return pos;
            }
        }
        return null;
    }


    public record Request (String requestType, String path) {}

    public Request parse(String request) {
        String[] keywords = request.split(" ");
        String requestType = keywords[0];
        String path = keywords[1];

        return new Request(requestType, path);
    }

    public void writeResponse(String message, BufferedWriter writer) throws Exception {
        writer.write("HTTP/1.1 200 OK\r\n");
        writer.write("Content-Type: text/plain\r\n");
        writer.write("Access-Control-Allow-Origin: *\r\n");
        writer.write("Content-Length: " + message.length() + "\r\n");
        writer.write("\r\n");
        writer.write(message);
    }

    public YahooPosition getYahooInformation(Position position, HttpClient client, HashMap<String, String> parameters) {

        // Valid intervals: [1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 4h, 1d, 5d, 1wk, 1mo, 3mo]

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://query1.finance.yahoo.com/v8/finance/chart/"
            + position.possibleYahooTicker
            + "?"
            + parameters.getOrDefault("interval", "interval=1d")
            + "&"
            + parameters.getOrDefault("range", "range=1mo"))
            )
            .header("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
            .header("Accept", "application/json")
            .GET()
            .build();

        try {
            HttpResponse<String> response = client.send(
                request, HttpResponse.BodyHandlers.ofString()
            );

            JSONObject json = new JSONObject(response.body());
            YahooPosition ypos = new YahooPosition(json);

            return ypos;

        } catch (Exception e) {
            String message = "YahooPosition fetch error";
            throw new RuntimeException(message + e);
        }

    }

    public List<CombinedPosition> getCombinedPositions(HashMap<String, String> params) {
        HttpClient client = HttpClient.newHttpClient();
        List<YahooPosition> yahoo_data = new ArrayList<YahooPosition>();
        List<CombinedPosition> combined_positions = new ArrayList<CombinedPosition>();
        for (Position pos : this.positions) {
            YahooPosition ypos = getYahooInformation(pos, client, params);
            yahoo_data.add(ypos);
            CombinedPosition combinedPosition = new CombinedPosition(pos, ypos);
            combined_positions.add(combinedPosition);
        }

        this.combined_positions = combined_positions;
        return combined_positions;

    }

}


