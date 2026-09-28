package jamie;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PasswordHasherTest {

    @Test
    void passwordCanBeVerified() {
        char[] password = "myPassword123".toCharArray();

        String hash = PasswordHasher.hash(password);

        assertTrue(
            PasswordHasher.verify(password, hash)
        );
    }

    @Test
    void incorrectPasswordFails() {
        char[] password = "myPassword123".toCharArray();
        char[] wrongPassword = "wrongPassword".toCharArray();

        String hash = PasswordHasher.hash(password);

        assertFalse(
            PasswordHasher.verify(wrongPassword, hash)
        );
    }
}
