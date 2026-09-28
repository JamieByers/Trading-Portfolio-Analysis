package jamie;

import java.io.BufferedWriter;
import java.nio.charset.StandardCharsets;

public class Responder {
    public static void handleOptionsRequest(BufferedWriter writer) throws Exception {
        writer.write("HTTP/1.1 204 No Content\r\n");
        writer.write("Access-Control-Allow-Origin: http://localhost:4321\r\n");
        writer.write("Access-Control-Allow-Credentials: true\r\n");
        writer.write("Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n");
        writer.write("Access-Control-Allow-Headers: Content-Type\r\n");
        writer.write("\r\n");
    }

    public static void writeResponse(String message, BufferedWriter writer) throws Exception {
        writer.write("HTTP/1.1 200 OK\r\n");
        writer.write("Content-Type: application/json\r\n");
        writer.write("Access-Control-Allow-Origin: http://localhost:4321\r\n");
        writer.write("Access-Control-Allow-Credentials: true\r\n");
        writer.write("Content-Length: " + message.getBytes(StandardCharsets.UTF_8).length + "\r\n");
        writer.write("\r\n");
        writer.write(message);
    }

    public static void writeErrorResponse(String message, BufferedWriter writer) throws Exception {
        writer.write("HTTP/1.1 500 Internal Server Error\r\n");
        writer.write("Content-Type: application/json\r\n");
        writer.write("Access-Control-Allow-Origin: http://localhost:4321\r\n");
        writer.write("Access-Control-Allow-Credentials: true\r\n");
        writer.write("Content-Length: " + message.getBytes(StandardCharsets.UTF_8).length + "\r\n");
        writer.write("\r\n");
        writer.write(message);
    }

    public static void writeCookieResponse(String message, String sessionId, BufferedWriter writer) throws Exception {
        writer.write("HTTP/1.1 200 OK\r\n");
        writer.write("Content-Type: application/json\r\n");
        writer.write("Access-Control-Allow-Origin: http://localhost:4321\r\n");
        writer.write("Access-Control-Allow-Credentials: true\r\n");
        writer.write("Set-Cookie: session_id=" + sessionId + "; Max-Age=600; Path=/; HttpOnly; SameSite=Lax\r\n");
        writer.write("Content-Length: " + message.getBytes(StandardCharsets.UTF_8).length + "\r\n");
        writer.write("\r\n");
        writer.write(message);
    }

    public static void writeLogoutResponse(String message, BufferedWriter writer) throws Exception {
        writer.write("HTTP/1.1 200 OK\r\n");
        writer.write("Content-Type: application/json\r\n");
        writer.write("Access-Control-Allow-Origin: http://localhost:4321\r\n");
        writer.write("Access-Control-Allow-Credentials: true\r\n");
        writer.write("Set-Cookie: session_id=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax\r\n");
        writer.write("Content-Length: " + message.getBytes(StandardCharsets.UTF_8).length + "\r\n");
        writer.write("\r\n");
        writer.write(message);
    }


}
