package jamie;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;

public class DatabaseTest {
    private Database db;

    @BeforeEach
    void setup() {
        db = new Database();
    }

    @Test
    void createUserAndLogin() throws Exception {
        String email = "createLoginTest@example.com";
        String password = "password123";

        db.createUser(email, password);

        assertTrue(
            db.loginUser(email, password) != ""
        );

        db.deleteUser(email);
    }

    // @Test
    // void deleteUserTest() throws Exception {
    //     String email = "createLoginTest@example.com";
    //     String password = "password123";

    //     db.createUser(email, password);

    //     db.deleteUser(email);

    //     assertTrue(db.loginUser(email, password) == "");
    // }

}
