package jamie;

import java.net.*;
import java.net.http.*;
import java.util.Base64;
import java.util.ArrayList;
import java.util.List;

import org.json.*;

import io.github.cdimascio.dotenv.Dotenv;

public class App {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        JSONArray json = getPortfolio(client);
        List<Position> positions = getPositionObjects(json);

        HttpServer server = new HttpServer(positions, client);
        server.initialise();
    }


    static public List<Position> getPositionObjects(JSONArray json) {
        List<Position> positions = new ArrayList<Position>();

        for ( Object line : json) {
            JSONObject o = (JSONObject) line;
            Position position = new Position();
            position.parse(o);
            // position.print();

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

            // System.out.println(json);
            return json;


        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
