package jamie;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

import io.github.cdimascio.dotenv.Dotenv;

public class Encryption {

    private static final String ALGORITHM = "AES/GCM/NoPadding";

    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;

    private static final String MASTER_KEY = getMasterKey();

    public static String encrypt(String data) throws Exception {

        byte[] iv = new byte[IV_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);

        byte[] keyBytes = Base64.getDecoder().decode(MASTER_KEY);

        SecretKeySpec secretKey = new SecretKeySpec(
            keyBytes,
            "AES"
        );

        Cipher cipher = Cipher.getInstance(ALGORITHM);

        GCMParameterSpec spec = new GCMParameterSpec(
            TAG_LENGTH,
            iv
        );

        cipher.init(
            Cipher.ENCRYPT_MODE,
            secretKey,
            spec
        );

        byte[] encryptedData = cipher.doFinal(
            data.getBytes(StandardCharsets.UTF_8)
        );

        byte[] result = new byte[
            iv.length + encryptedData.length
        ];

        System.arraycopy(
            iv,
            0,
            result,
            0,
            iv.length
        );

        System.arraycopy(
            encryptedData,
            0,
            result,
            iv.length,
            encryptedData.length
        );

        return Base64.getEncoder().encodeToString(result);
    }

    public static String decrypt(String data) throws Exception {

        byte[] combined = Base64.getDecoder().decode(data);

        byte[] iv = new byte[IV_LENGTH];

        byte[] encryptedData = new byte[
            combined.length - IV_LENGTH
        ];

        System.arraycopy(
            combined,
            0,
            iv,
            0,
            IV_LENGTH
        );

        System.arraycopy(
            combined,
            IV_LENGTH,
            encryptedData,
            0,
            encryptedData.length
        );

        byte[] keyBytes = Base64.getDecoder().decode(MASTER_KEY);

        SecretKeySpec secretKey = new SecretKeySpec(
            keyBytes,
            "AES"
        );

        Cipher cipher = Cipher.getInstance(ALGORITHM);

        GCMParameterSpec spec = new GCMParameterSpec(
            TAG_LENGTH,
            iv
        );

        cipher.init(
            Cipher.DECRYPT_MODE,
            secretKey,
            spec
        );

        byte[] decryptedData = cipher.doFinal(
            encryptedData
        );

        return new String(
            decryptedData,
            StandardCharsets.UTF_8
        );
    }

    private static String getMasterKey() {

        Dotenv dotenv = Dotenv.load();

        String key = dotenv.get("ENCRYPTION_MASTER_KEY");

        return key;
    }
}
