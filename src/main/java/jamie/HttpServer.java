package jamie;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.*;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.regex.*;

import org.json.JSONObject;

import com.fasterxml.jackson.databind.ObjectMapper;

record PriceChangeToday(String timestamp, double runningTotal) {};

public class HttpServer {
    public List<CombinedPosition> combined_positions;
    public List<Position> positions;
    public HttpClient client;
    public String oldest_pos;

    public Cache<String> cache;
    public Cache<YahooPosition> yahooCache;

    private final ObjectMapper mapper = new ObjectMapper();

    public HttpServer(List<Position> positions, HttpClient client) {
        this.positions = positions;
        this.client = client;
        this.combined_positions = null;
        this.oldest_pos = null;
        this.cache = new Cache<String>();
        this.yahooCache = new Cache<YahooPosition>();
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

    public void print(String[] l) {
        for ( String el : l ) {
            System.out.println(el);
        }
        System.out.println();
    }

    // TODO: Fix this whole routing system to work with the server /api is messing with it
    public void route(String path, BufferedWriter writer) throws Exception {
        String cache = this.cache.getFromCache(path);
        if (cache != null) {
            writeResponse(cache, writer);
            return;
        }

        // /api/all?range=...&interval=...
        String route = path;
        if (path.startsWith("/api")) {
            route = route.substring(4);
        }

        // /all?range=...&interval=...
        String[] split_path = route.split("\\?");

        // ["/all", "range=...&interval=..."]
        String matching_path = split_path[0];
        HashMap<String, String> params = handleParams(split_path);


        // "/all"
        switch (matching_path) {
            case "/coffee":
                writeResponse("Coffee!!!!", writer);
                break;

            case "/all":
                List<CombinedPosition> combinedPositionsAll = getCombinedPositions(params);
                this.combined_positions = combinedPositionsAll;
                String json = mapper.writeValueAsString(combinedPositionsAll);

                this.cache.addToCache(path, json);
                writeResponse(json.toString(), writer);
                break;

            case "/profit-over-time":
                List<CombinedPosition> cps = new ArrayList<>();
                for ( Position p : this.positions ) {
                    HashMap<String, String> params_map = new HashMap<>();
                    params_map.put("range", "range="+p.holdingTime+"d");
                    params_map.put("interval", "interval=1d");

                    YahooPosition yp = getYahooInformation(p.possibleYahooTicker, params_map);
                    CombinedPosition cp = new CombinedPosition(p, yp);

                    double runningTotal = p.totalCost;

                    for (TimestampElement te : yp.timestamp_elements) {
                        double priceChangePercentageAbsolute = te.priceChangePercentage / 100;
                        double change = 1 + priceChangePercentageAbsolute;
                        runningTotal *= change;

                        te.profit = runningTotal - p.totalCost;
                    }

                    cps.add(cp);
                }

                String cpsJson = mapper.writeValueAsString(cps);

                this.cache.addToCache(path, cpsJson);
                writeResponse(cpsJson, writer);

                break;

            default:
                Position pos = findPosition(matching_path, positions);

                if (pos == null) {
                    YahooPosition yp = getYahooInformation(matching_path, params);
                    CombinedPosition new_cp = new CombinedPosition(null, yp);
                    String new_cp_json = new_cp.toJson();

                    this.cache.addToCache(path, new_cp_json);
                    writeResponse(new_cp_json, writer);
                    break;
                } else {
                    CombinedPosition new_cp = getCombinedPosition(pos, params);
                    String new_cp_json = new_cp.toJson();

                    this.cache.addToCache(path, new_cp_json);
                    writeResponse(new_cp_json, writer);
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

    public Position findPosition(String ticker, List<Position> positions) {
        ticker = ticker.substring(1);
        System.out.println("linear searching " + ticker);
        for ( Position pos : positions ) {
            if (pos.ticker.contains(ticker)) {
                return pos;
            }
        }
        return null;
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
        writer.write("Content-Type: application/json\r\n");
        writer.write("Access-Control-Allow-Origin: *\r\n");
        writer.write("Content-Length: " + message.length() + "\r\n");
        writer.write("\r\n");
        writer.write(message);
    }

    public YahooPosition getYahooInformation(String ticker, HashMap<String, String> parameters) {
        System.out.println(parameters);

        // Valid intervals: [1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 4h, 1d, 5d, 1wk, 1mo, 3mo]

        String input_timestamp = parameters.getOrDefault("timestamp", parameters.getOrDefault("ts", "")); // example ts: 19-07-26
        String range = parameters.getOrDefault("range", "range=1mo");

        // TODO: figure out this silly custom timestamping
        if (input_timestamp != "") {
            String custom_timestamp = input_timestamp.split("=")[1];
            System.out.println(custom_timestamp);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yy");
            LocalDate date = LocalDate.parse(custom_timestamp, formatter);
            System.out.println(date);

            Instant start = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant end = Instant.now();

            long minimum_range = Duration.between(start, end).toDays();
            System.out.println(minimum_range);

            String range_time = range.split("=")[1];
            System.out.println(range_time);

            Pattern pattern = Pattern.compile("(\\d+)(mo|wk|m|d|h)");
            Matcher matcher = pattern.matcher(range_time);

            if (matcher.matches()) {
                long range_value = Integer.parseInt(matcher.group(1));
                String range_period = matcher.group(2);
                System.out.println(range_value + " " + range_period);

                double mult = 0;
                switch (range_period) {
                    case "mo":
                        mult = 31;
                        break;
                    case "wk":
                        mult = 7;
                        break;
                    case "d":
                        mult = 1;
                        break;
                    case "h":
                        mult = 1 / 24;
                        break;
                    case "m":
                        mult = 1 / 1440;
                        break;
                }

                double current_value = range_value * mult;
                System.out.println("current val "+ current_value + " " + mult);
                if (mult > 0 && minimum_range > current_value) {
                    minimum_range -= Math.floor(minimum_range / 7) * 2 ;
                    range = "range=" + minimum_range + "d";
                    System.out.println(range);
                }

            }

        }


        String api_path = ticker
            + "?"
            + parameters.getOrDefault("interval", "interval=1d")
            + "&"
            + range;

        YahooPosition cache_hit = this.yahooCache.getFromCache(api_path);
        if (cache_hit != null) {
            return cache_hit;
        }

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://query1.finance.yahoo.com/v8/finance/chart/"
            + api_path
            )
            )
            .header("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
            .header("Accept", "application/json")
            .GET()
            .build();

        try {
            HttpResponse<String> response = this.client.send(
                request, HttpResponse.BodyHandlers.ofString()
            );

            System.out.println(response);
            JSONObject json = new JSONObject(response.body());
            YahooPosition ypos = new YahooPosition(json);

            this.yahooCache.addToCache(api_path, ypos);
            return ypos;

        } catch (Exception e) {
            String message = "YahooPosition fetch error";
            throw new RuntimeException(message + e);
        }

    }

    public CombinedPosition getCombinedPosition(Position pos, HashMap<String, String> params) {
        YahooPosition ypos = getYahooInformation(pos.possibleYahooTicker, params);
        CombinedPosition combinedPosition = new CombinedPosition(pos, ypos);
        return combinedPosition;
    }

    public List<CombinedPosition> getCombinedPositions(HashMap<String, String> params) {
        List<CombinedPosition> combined_positions = new ArrayList<CombinedPosition>();
        List<Thread> threads = new ArrayList<>();

        for (Position pos : this.positions) {

            Thread thread = new Thread(() -> {
                CombinedPosition cp = getCombinedPosition(pos, params);

                synchronized (combined_positions) {
                    combined_positions.add(cp);
                }
            });

            threads.add(thread);
            thread.start();
        }

        for (Thread thread : threads) {
            try {
                thread.join();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        this.combined_positions = combined_positions;
        return combined_positions;

    }

}


