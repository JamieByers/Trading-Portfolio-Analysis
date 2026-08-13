package jamie;

import java.net.*;
import java.net.http.*;
import java.util.Base64;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


import org.json.*;

import io.github.cdimascio.dotenv.Dotenv;

public class App {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        JSONArray json = getPortfolio(client);
        List<Position> positions = getPositionObjects(json);
        List<YahooPosition> yahoo_data = new ArrayList<YahooPosition>();
        HashMap<Position, YahooPosition> position_data = new HashMap<Position, YahooPosition>();

        for (Position pos : positions) {
            YahooPosition ypos = getYahooInformation(pos, client);
            position_data.put(pos, ypos);
            yahoo_data.add(ypos);
        }

        yahoo_data.get(2).printJson();
        yahoo_data.get(2).print();

    }

    public static YahooPosition getYahooInformation(Position position, HttpClient client) {

        // Valid intervals: [1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 4h, 1d, 5d, 1wk, 1mo, 3mo]
        Map<String, String> parameters = Map.of(
            "interval", "interval=1d",
            "range", "range=1wk"
        );


        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://query1.finance.yahoo.com/v8/finance/chart/"
            + position.possibleYahooTicker
            + "?"
            + parameters.get("interval")
            + "&"
            + parameters.get("range"))
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
            throw new RuntimeException(e);
        }

    }

    static public List<Position> getPositionObjects(JSONArray json) {
        List<Position> positions = new ArrayList<Position>();

        for ( Object line : json) {
            JSONObject o = (JSONObject) line;
            // System.out.println(o);
            Position position = new Position();
            position.parse(o);
            position.print();

            positions.add(position);
        }

        return positions;
    }

    static public JSONArray getPortfolio(HttpClient client) {
        Dotenv dotenv = Dotenv.load();
        String PUBLIC_KEY = dotenv.get("PUBLIC_KEY");
        String SECRET_KEY = dotenv.get("SECRET_KEY");

        String CREDENTIALS = PUBLIC_KEY + ":" + SECRET_KEY;

        String encodedCreds = Base64.getEncoder().encodeToString(CREDENTIALS.getBytes());

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create("https://live.trading212.com/api/v0/equity/positions"))
            .header("Authorization", "Basic " + encodedCreds)
            .GET()
            .build();

        try {
            HttpResponse<String> response = client.send(
                req,
                HttpResponse.BodyHandlers.ofString()
            );

            JSONArray json = new JSONArray(response.body());

            System.out.println(json);
            return json;


        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
