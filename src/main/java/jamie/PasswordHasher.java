package jamie;

import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;

public class PasswordHasher {

    private static final Argon2 argon2 =
        Argon2Factory.create();

    public static String hash(char[] password) {
        return argon2.hash(3, 65536, 1, password);
    }

    public static boolean verify(char[] password, String hash) {
        return argon2.verify(hash, password);
    }
}
