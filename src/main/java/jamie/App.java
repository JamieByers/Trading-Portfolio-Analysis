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

        List<Position> positions = getPositionObjects(client);

        HttpServer server = new HttpServer(positions, client);
        server.initialise();
    }


    public static List<Position> getPositionObjects(HttpClient client) {
        HttpResponse<String> response = getRequestPortfolio(client, "https://live.trading212.com/api/v0/equity/positions");
        JSONArray json = new JSONArray(response.body());
        List<Position> positions = new ArrayList<Position>();

        for ( Object line : json) {
            JSONObject o = (JSONObject) line;
            Position position = new Position();
            position.parse(o);

            positions.add(position);
        }

        return positions;
    }

    public static void getPortfolioHistory(HttpClient client) {
        var payload = String.join("\n"
            , "{"
            , " \"dataIncluded\": {"
            , "  \"includeDividends\": true,"
            , "  \"includeInterest\": true,"
            , "  \"includeOrders\": true,"
            , "  \"includeTransactions\": true"
            , " },"
            , " \"timeFrom\": \"2026-01-01T14:15:22Z\","
            , " \"timeTo\": \"2026-08-24T14:15:22Z\""
            , "}"
        );

        // HttpResponse<String> postResponse = postRequestPortfolio(client, "https://live.trading212.com/api/v0/equity/history/exports", payload);
        // System.out.println(postResponse);
        // System.out.println(postResponse.body());
        // JSONObject reportIdJson = new JSONObject(postResponse.body());
        // String reportID = Integer.toString(reportIdJson.getInt("reportId"));

        try {
            Thread.sleep(2000);
            HttpResponse<String> getResponse = getRequestPortfolio(client, "https://live.trading212.com/api/v0/equity/history/exports");

            while (getResponse.statusCode() != 200) {
                Thread.sleep(30000);
                getResponse = getRequestPortfolio(client, "https://live.trading212.com/api/v0/equity/history/exports/" );
                System.out.println(getResponse);
                System.out.println(getResponse.body());
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    public static String getAPIKey() {
        Dotenv dotenv = Dotenv.load();

        String PUBLIC_KEY = dotenv.get("PUBLIC_KEY");
        String SECRET_KEY = dotenv.get("SECRET_KEY");

        String CREDENTIALS = PUBLIC_KEY + ":" + SECRET_KEY;

        String encodedCreds = Base64.getEncoder().encodeToString(CREDENTIALS.getBytes());
        return encodedCreds;

    }


    public static HttpResponse<String> getRequestPortfolio(HttpClient client, String url) {
        String API_KEY = getAPIKey();

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Basic " + API_KEY)
            .header("Content-Type", "application/json")
            .GET()
            .build();

        try {
            HttpResponse<String> response = client.send(
                req,
                HttpResponse.BodyHandlers.ofString()
            );
            return response;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static HttpResponse<String> postRequestPortfolio(HttpClient client, String url, String jsonBody) {
        String API_KEY = getAPIKey();

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Basic " + API_KEY)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();

        try {
            HttpResponse<String> response = client.send(
                req,
                HttpResponse.BodyHandlers.ofString()
            );
            return response;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }



    }
}
