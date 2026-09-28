package jamie;

import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.net.*;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.regex.*;
import java.util.Base64;

import org.json.JSONObject;
import org.json.JSONArray;



public class DataCollector {
    public Cache<String> cache;
    public Cache<List<Position>> positionsCache;
    public Cache<YahooPosition> yahooCache;

    public HttpClient client;

    public DataCollector(HttpClient client) {
        this.cache = new Cache<String>();
        this.yahooCache = new Cache<YahooPosition>();
        this.positionsCache = new Cache<List<Position>>();
        this.client = client;
    }

    public CombinedPosition getCombinedPosition(Position pos, HashMap<String, String> params) {
        YahooPosition ypos = getYahooInformation(pos.possibleYahooTicker, params);
        CombinedPosition combinedPosition = new CombinedPosition(pos, ypos);
        return combinedPosition;
    }

    public List<CombinedPosition> getCombinedPositions(HashMap<String, String> params, List<Position> positions) {
        List<CombinedPosition> combined_positions = new ArrayList<CombinedPosition>();
        List<Thread> threads = new ArrayList<>();

        for (Position pos : positions) {

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
                throw new RuntimeException("Thread Error in getCombinedPositions: " + e);
            }
        }

        return combined_positions;

    }

    public String handleAPIKey(String[] keys) {
        String PUBLIC_KEY = keys[0];
        String SECRET_KEY = keys[1];

        String CREDENTIALS = PUBLIC_KEY + ":" + SECRET_KEY;

        String encodedCreds = Base64.getEncoder().encodeToString(CREDENTIALS.getBytes());
        return encodedCreds;
    }


    public List<Position> getPositionObjects(String[] keys) {
        if (keys.length != 2) {
            System.out.println("ERROR: Expected 2 trading keys");
            return new ArrayList<>();
        }

        HttpResponse<String> response = getRequestPortfolio(
            "https://live.trading212.com/api/v0/equity/positions",
            keys
        );

        if (response.statusCode() != 200) {
            System.out.println("Trading 212 error: " + response.body());
            return new ArrayList<>();
        }

        JSONArray json = new JSONArray(response.body());

        List<Position> positions = new ArrayList<>();

        for (Object line : json) {
            JSONObject o = (JSONObject) line;

            Position position = new Position();
            position.parse(o);

            positions.add(position);
        }

        return positions;
    }

    public List<Position> getPositions(String user_id, String[] keys) {
        String cacheKey = "positions:" + user_id;
        List<Position> positions = this.positionsCache.getFromCache(cacheKey);

        if (positions != null) {
            System.out.println("Successfully got positions from cache");
            return positions;
        }

        List<Position> fetchedPositions = getPositionObjects(keys);
        if (!fetchedPositions.isEmpty()) {
            this.positionsCache.addToCache(cacheKey, fetchedPositions);
        }
        return fetchedPositions;
    }

    public HttpResponse<String> getRequestPortfolio(String url, String[] keys) {
        String API_KEY = handleAPIKey(keys);

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Basic " + API_KEY)
            .header("Content-Type", "application/json")
            .GET()
            .build();

        try {
            HttpResponse<String> response = this.client.send(
                req,
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                throw new RuntimeException("Could not get portfolio in getRequestPortfolio: " + response);
            }
            return response;

        } catch (Exception e) {
            throw new RuntimeException("Response failed in getRequestPortfolio: " + e);
        }
    }


    public YahooPosition getYahooInformation(String ticker, HashMap<String, String> parameters) {
        // Valid intervals: [1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 4h, 1d, 5d, 1wk, 1mo, 3mo]

        String input_timestamp = parameters.getOrDefault("timestamp", parameters.getOrDefault("ts", "")); // example ts: 19-07-26
        String range = parameters.getOrDefault("range", "range=1mo");

        // TODO: figure out this silly custom timestamping
        if (!input_timestamp.isEmpty()) {
            String custom_timestamp = input_timestamp.split("=")[1];

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yy");
            LocalDate date = LocalDate.parse(custom_timestamp, formatter);

            Instant start = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant end = Instant.now();

            long minimum_range = Duration.between(start, end).toDays();

            String range_time = range.split("=")[1];

            Pattern pattern = Pattern.compile("(\\d+)(mo|wk|m|d|h)");
            Matcher matcher = pattern.matcher(range_time);

            if (matcher.matches()) {
                long range_value = Integer.parseInt(matcher.group(1));
                String range_period = matcher.group(2);

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
                        mult = 1.0 / 24.0;
                        break;
                    case "m":
                        mult = 1.0 / 1440.0;
                        break;
                }

                double current_value = range_value * mult;
                if (mult > 0 && minimum_range > current_value) {
                    minimum_range -= Math.floor(minimum_range / 7) * 2 ;
                    range = "range=" + minimum_range + "d";
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
                request,
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                throw new RuntimeException(
                    "Yahoo Finance returned HTTP "
                    + response.statusCode()
                    + " for ticker "
                    + ticker
                    + ": "
                    + response.body()
                );
            }

            JSONObject json = new JSONObject(response.body());

            YahooPosition ypos = new YahooPosition(json);

            this.yahooCache.addToCache(api_path, ypos);

            return ypos;

        } catch (Exception e) {
            throw new RuntimeException(
                "CUSTOM ERROR: YahooPosition fetch error for ticker: ["
                + ticker
                + "]: "
                + e.getMessage(),
                e
            );
        }
    }

}
