package jamie;

import java.net.http.*;

public class App {
    public static void main(String[] args) throws Exception  {
        HttpClient client = HttpClient.newHttpClient();

        HttpServer server = new HttpServer(client);
        server.initialise();
    }

}
