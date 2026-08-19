package jamie;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import com.fasterxml.jackson.databind.ObjectMapper;

public class HttpServer {
    public List<CombinedPosition> combined_positions;

    public HttpServer(List<CombinedPosition> combined_positions) {
        this.combined_positions = combined_positions;
    }

    public void initialise() {
        try{
            ServerSocket server = new ServerSocket(8080);

            boolean running = true;
            while (running) {
                Socket socket = server.accept();

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
            }

            server.close();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public HashMap<String, String> route(String path, BufferedWriter writer) throws Exception {
        HashMap<String, String> param_details = handleParams(path);
        switch (path) {
            case "/coffee":
                writeResponse("Coffee!!!!", writer);
                break;

            case "/all":
                ObjectMapper mapper = new ObjectMapper();
                String json = mapper.writeValueAsString(this.combined_positions);

                writeResponse(json.toString(), writer);
                break;

            default:
                CombinedPosition pos = linearSearch(path.substring(1));
                if (pos == null) {
                    writeResponse("Failed to find a position with ticker: " + path, writer);
                    break;
                } else {
                    writeResponse(pos.toJson(), writer);
                    break;
                }
        }

        return param_details;
    }

    public HashMap<String, String> handleParams(String path) {
        String[] split_path = path.split("\\?");
        HashMap<String, String> param_details = new HashMap<String, String>();

        if (split_path.length > 1) {
            String params = split_path[1];

            String[] split_params = params.split("\\&");

            for (String param : split_params) {
                String[] split_param = param.split("\\=");
                String paramater = split_param[0];
                String value = split_params[1];

                param_details.put(paramater, value);
            }

        }
        return param_details;
    }

    public CombinedPosition linearSearch(String ticker) {
        for ( CombinedPosition pos : this.combined_positions ) {
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

}


