package jamie;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;

public class Database {

    String URL = "jdbc:postgresql://localhost:5432/trading";
    String USERNAME = "jamiebyers";
    Connection db;

    public Database() {
        try {
            this.db = DriverManager.getConnection(URL, USERNAME, "");

        } catch (Exception e) {
            System.out.println(e);
        }
    }

    public boolean createUser(String email, String password) throws Exception {
        if (!validateEmail(email)) { throw new RuntimeException("Email is not valid."); }

        char[] passwordArray = password.toCharArray();
        String passwordHash = PasswordHasher.hash(passwordArray);

        String sql = """
            INSERT INTO users (email, password_hash, user_type)
            VALUES (?, ?, 'STANDARD')
            RETURNING id
            """;

        try (PreparedStatement st = db.prepareStatement(sql)) {

            st.setString(1, email);
            st.setString(2, passwordHash);

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    int user_id = rs.getInt("id");
                    createAccountSettingsForUserWithUserID(user_id);

                    st.close();
                    return true;
                }
            }
        } catch (SQLException e) {
            throw e;
        }

        return false;
    }

    public boolean deleteUser(String user_id) throws Exception {
        String sql = "DELETE FROM users WHERE id = ?";

        try (PreparedStatement st = db.prepareStatement(sql)) {
            st.setInt(1, Integer.parseInt(user_id));
            int deletedUser = st.executeUpdate();
            if (deletedUser == 1) { return true; } else { return false; }
        }
    }

    public boolean createAccountSettingsForUserWithUserID(int user_id) throws Exception {
        String sql = "INSERT INTO account_settings (user_id) VALUES (?)";

        try (PreparedStatement st = db.prepareStatement(sql)) {
            st.setInt(1, user_id);
            st.executeUpdate();
            return true;
        }
    }

    public HashMap<String, String> selectFromUsersUsingID(String id) throws Exception {
        String sql = """
            SELECT *
            FROM users
            WHERE id = ?
            """;

        try (PreparedStatement st = db.prepareStatement(sql)) {
            st.setInt(1, Integer.parseInt(id));

            try (ResultSet rs = st.executeQuery()) {

                if (!rs.next()) {
                    return null;
                }

                String email = rs.getString("email");
                String user_type = rs.getString("user_type");

                HashMap<String, String> output = new HashMap<>();

                output.put("id", id);
                output.put("email", email);
                output.put("user_type", user_type);

                st.close();

                return output;
            }
        }
    }

    public String loginUser(String email, String password) throws Exception {
        if (!validateEmail(email)) { return ""; }

        System.out.println("Matching user: " + email + password);

        PreparedStatement st = this.db.prepareStatement("SELECT * FROM users WHERE email = ?");
        st.setString(1, email);

        ResultSet rs = st.executeQuery();

        if (!rs.next()) {
            rs.close();
            st.close();
            return "";
        }

        String user_id = rs.getString("id");
        String hash = rs.getString("password_hash");

        System.out.println(user_id + " " + hash);

        rs.close();
        st.close();

        System.out.println(PasswordHasher.verify(password.toCharArray(), hash));

        if (PasswordHasher.verify(password.toCharArray(), hash)) {
            return user_id;
        } else {
            return "";
        }
    }

    public boolean[] editUserEmailOrPassword(String user_id, String new_email, String password, String confirm_password) throws Exception {
        boolean[] success = {true, true};

        System.out.println("CHANGING USER " + user_id + " " + new_email + "  " + password);

        if (password != null && !password.isEmpty() && password.equals(confirm_password)) {
            String passwordHash = PasswordHasher.hash(password.toCharArray());
            String sql = "UPDATE users SET password_hash = ? WHERE id = ?";
            try (PreparedStatement st = db.prepareStatement(sql)) {
                st.setString(1, passwordHash);
                st.setInt(2, Integer.parseInt(user_id));
                st.executeUpdate();
                st.close();
            }
        } else {
            success[1] = false;

        }

        if (!validateEmail(new_email)) { success[0] = false; }
        if (new_email != null && !new_email.isEmpty() && success[0] == true) {
            String sql = "UPDATE users SET email = ? WHERE id = ?";
            try (PreparedStatement st = db.prepareStatement(sql)) {
                st.setString(1, new_email);
                st.setInt(2, Integer.parseInt(user_id));
                st.executeUpdate();
                st.close();
            }
        }

        return success;
    }

    public boolean editUserAttribute(String attr, String value, String email) throws Exception {
        if (!validateEmail(email)) { return false; }

        String sql = "UPDATE users SET ? = ? WHERE email = ?";
        PreparedStatement st = db.prepareStatement(sql);
        st.setString(1, attr);
        st.setString(2, value);
        st.setString(3, email);
        st.executeUpdate();
        st.close();

        return true;
    }

    public String createSession(String id) throws Exception {
        HashMap<String, String> user = selectFromUsersUsingID(id);

        String interval = "60 mins";
        if (user.get("user_type").equals("ADMIN")) {
            interval = "999999 mins";
        }

        String sql = "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, NOW() + CAST(? AS INTERVAL));";
        try (PreparedStatement st = db.prepareStatement(sql)) {
            String session_id = UUID.randomUUID().toString();
            st.setString(1, session_id);
            st.setInt(2, Integer.parseInt(id));
            st.setString(3, interval);
            st.executeUpdate();
            st.close();

            return session_id;
        }
    }

    public String createAdminSession(String id) throws Exception {
        String sql = "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, NOW() + INTERVAL '999999 mins');";
        try (PreparedStatement st = db.prepareStatement(sql)) {
            String session_id = UUID.randomUUID().toString();
            st.setString(1, session_id);
            st.setInt(2, Integer.parseInt(id));
            st.executeUpdate();
            st.close();

            return session_id;
        }
    }

    public String checkSessionIDExists(String id) throws Exception {
        String sql = "SELECT * FROM sessions WHERE id = ?";
        try (PreparedStatement st = this.db.prepareStatement(sql)) {
            st.setString(1, id);
            ResultSet rs = st.executeQuery();

            if (!rs.next()) {
                rs.close();
                st.close();
                return "";
            }

            return rs.getString("id");
        }
    }


    public String getSessionID(String user_id) throws Exception {
        String sql = "SELECT * FROM sessions WHERE user_id = ?";
        try (PreparedStatement st = this.db.prepareStatement(sql)) {
            st.setInt(1, Integer.parseInt(user_id));
            ResultSet rs = st.executeQuery();

            if (!rs.next()) {
                rs.close();
                st.close();
                return "";
            }

            return rs.getString("id");
        }
    }

    public String getUserIDFromSession(String id) throws Exception {
        String sql = "SELECT * FROM sessions WHERE id = ?";
        try (PreparedStatement st = this.db.prepareStatement(sql)) {
            st.setString(1, id);
            ResultSet rs = st.executeQuery();

            if (!rs.next()) {
                rs.close();
                st.close();
                return "";
            }

            return rs.getString("user_id");
        }
    }

    public void deleteSessionsWithId(String id) throws Exception {
        String sql = "DELETE FROM sessions WHERE user_id = ?";
        try (PreparedStatement st = db.prepareStatement(sql)) {
            st.setInt(1, Integer.parseInt(id));
            st.executeUpdate();
            st.close();
        }
    }

    public void deleteSessionsWithSessionID(String id) throws Exception {
        String sql = "DELETE FROM sessions WHERE id = ?";
        try (PreparedStatement st = db.prepareStatement(sql)) {
            st.setString(1, id);
            st.executeUpdate();
            st.close();
        }
    }



    public String createTradingKey(String publicKey, String privateKey, String user_id) throws Exception {
        String getCurrentKeys = "SELECT id FROM trading_keys WHERE user_id = ?";

        System.out.println("Handling trading key: " + publicKey);

        try ( PreparedStatement gckst = db.prepareStatement(getCurrentKeys) ) {
            gckst.setInt(1, Integer.parseInt(user_id));
            ResultSet gckrs = gckst.executeQuery();

            if (!gckrs.next()) {
                String id = createNewTradingKeys(publicKey, privateKey, user_id);
                return id;
            } else {
                String id = gckrs.getString("id");
                updateCurrentTradingKeys(publicKey, privateKey, user_id);
                return id;
            }
        }
    }

    public String createNewTradingKeys(String publicKey, String privateKey, String user_id) throws Exception {
        String encryptedPrivateKey = Encryption.encrypt(privateKey);

        System.out.println("Creating new trading key");

        String sql = """
        INSERT INTO trading_keys (id, public, private, user_id)
        VALUES (?, ?, ?, ?)
        """;

        try (PreparedStatement st = db.prepareStatement(sql)) {

            String uuid = UUID.randomUUID().toString();
            st.setString(1, uuid);
            st.setString(2, publicKey);
            st.setString(3, encryptedPrivateKey);
            st.setInt(4, Integer.parseInt(user_id));

            st.executeUpdate();
            st.close();

            return uuid;

        } catch (SQLException e) {
            return "";
        }

    }

    public boolean updateCurrentTradingKeys(String publicKey, String privateKey, String user_id) throws Exception {
        String encryptedPrivateKey = Encryption.encrypt(privateKey);

        System.out.println("Trading key already exists");

        String sql = "UPDATE trading_keys SET public=?, private=? WHERE user_id = ?";

        try (PreparedStatement st = db.prepareStatement(sql)) {
            st.setString(1, publicKey);
            st.setString(2, encryptedPrivateKey);
            st.setInt(3, Integer.parseInt(user_id));

            st.executeUpdate();
            st.close();

            return true;
        }
    }

    public String[] getTradingKeysWithUserID(String user_id) throws Exception {
        System.out.println("Getting trading keys for user: " + user_id);

        String sql = "SELECT * FROM trading_keys WHERE user_id = ?";

        PreparedStatement st = db.prepareStatement(sql);
        st.setInt(1, Integer.parseInt(user_id));

        try (ResultSet rs = st.executeQuery()) {
            if (!rs.next()) {
                System.out.println("NO TRADING KEY FOUND");
                st.close();
                return new String[0];
            }

            String publicKey = rs.getString("public");
            String encryptedPrivateKey = rs.getString("private");
            String privateKey = Encryption.decrypt(encryptedPrivateKey);

            String[] keys = { publicKey, privateKey };

            st.close();

            return keys;
        }
    }

    public boolean validateEmail(String email) {
        if (!email.contains("@")) { return false; };
        if (!email.contains(".")) { return false; };

        return true;
    }

    public HashMap<String, String> getAccountSettingsWithUserID(String user_id) throws Exception {
        HashMap<String, String> map = new HashMap<>();
        String sql = "SELECT * FROM account_settings WHERE user_id = ?";
        try (PreparedStatement st = db.prepareStatement(sql)) {
            st.setInt(1, Integer.parseInt(user_id));
            ResultSet rs = st.executeQuery();

            if (!rs.next()) {
                return null;
            }

            boolean privacy_mode = rs.getBoolean("privacy_mode");
            boolean dark_mode = rs.getBoolean("dark_mode");

            map.put("privacy_mode", Boolean.toString(privacy_mode));
            map.put("dark_mode", Boolean.toString(dark_mode));

            return map;
        }
    }

    public HashMap<String, ArrayList<String>> getAllUserData() throws Exception {
        String sql = "SELECT * FROM users;";

        PreparedStatement st = db.prepareStatement(sql);
        try (ResultSet rs = st.executeQuery()) {
            HashMap<String, ArrayList<String>> users = new HashMap<>();

            users.put("id", new ArrayList<>());
            users.put("email", new ArrayList<>());
            users.put("password_hash", new ArrayList<>());
            users.put("user_type", new ArrayList<>());

            while (rs.next()) {
                int id = rs.getInt("id");
                String email = rs.getString("email");
                String password_hash = rs.getString("password_hash");
                String user_type = rs.getString("user_type");

                users.get("id").add(Integer.toString(id));
                users.get("email").add(email);
                users.get("password_hash").add(password_hash);
                users.get("user_type").add(user_type);
            }

            return users;
        }
    }

    public HashMap<String, ArrayList<String>> getAllTradingKeysData() throws Exception {
        String sql = "SELECT * FROM trading_keys;";

        PreparedStatement st = db.prepareStatement(sql);
        try (ResultSet rs = st.executeQuery()) {
            HashMap<String, ArrayList<String>> trading_keys = new HashMap<>();

            trading_keys.put("id", new ArrayList<>());
            trading_keys.put("hasKey", new ArrayList<>());
            trading_keys.put("user_id", new ArrayList<>());

            while (rs.next()) {
                String id = rs.getString("id");
                String publicKey = rs.getString("public");
                String privateKey = rs.getString("private");
                int user_id = rs.getInt("user_id");

                trading_keys.get("id").add(id);
                if (!publicKey.isBlank() && !privateKey.isBlank()) {
                    trading_keys.get("hasKey").add("true");
                } else {
                    trading_keys.get("hasKey").add("false");
                }
                trading_keys.get("user_id").add(Integer.toString(user_id));
            }

            return trading_keys;
        }
    }

    public HashMap<String, ArrayList<String>> getAllSessionData() throws Exception {
        String sql = "SELECT * FROM sessions;";

        PreparedStatement st = db.prepareStatement(sql);
        try (ResultSet rs = st.executeQuery()) {
            HashMap<String, ArrayList<String>> sessions = new HashMap<>();

            sessions.put("id", new ArrayList<>());
            sessions.put("user_id", new ArrayList<>());
            sessions.put("expires_at", new ArrayList<>());

            while (rs.next()) {
                String id = rs.getString("id");
                String user_id = rs.getString("user_id");
                String expires_at = rs.getString("expires_at");

                sessions.get("id").add(id);
                sessions.get("user_id").add(user_id);
                sessions.get("expires_at").add(expires_at);
            }

            return sessions;
        }
    }

    public boolean togglePrivacyMode(String user_id) throws Exception {
        String sql = "SELECT * FROM account_settings WHERE user_id = ?";
        int id = Integer.parseInt(user_id);

        try(PreparedStatement st = db.prepareStatement(sql)) {
            st.setInt(1, id);

            ResultSet rs = st.executeQuery();

            if (!rs.next()) {
                return false;
            }

            boolean status = rs.getBoolean("privacy_mode");
            boolean newStatus = !status;

            String updateSql = "UPDATE account_settings SET privacy_mode = ? WHERE user_id = ?";

            try (PreparedStatement ust = db.prepareStatement(updateSql)) {
                ust.setBoolean(1, newStatus);
                ust.setInt(2, id);
                ust.executeUpdate();

                return true;
            }
        }
    }
    public boolean toggleDarkMode(String user_id) throws Exception {
        String sql = "SELECT * FROM account_settings WHERE user_id = ?";
        int id = Integer.parseInt(user_id);

        try(PreparedStatement st = db.prepareStatement(sql)) {
            st.setInt(1, id);

            ResultSet rs = st.executeQuery();

            if (!rs.next()) {
                return false;
            }

            boolean status = rs.getBoolean("dark_mode");
            boolean newStatus = !status;

            String updateSql = "UPDATE account_settings SET dark_mode = ? WHERE user_id = ?";

            try (PreparedStatement ust = db.prepareStatement(updateSql)) {
                ust.setBoolean(1, newStatus);
                ust.setInt(2, id);
                ust.executeUpdate();

                return true;
            }
        }
    }
}
