package jamie;

import org.json.JSONArray;
import org.json.JSONObject;
import java.time.*;
import java.util.*;


public class YahooPosition {
    public JSONObject json;

    // meta
    String name;
    String ticker;
    String timezone;
    String range;
    String currency;
    float fiftyTwoWeekHigh;

    // indicators
    JSONArray volume;
    JSONArray high;
    JSONArray low;
    JSONArray close;
    JSONArray open;

    List<String> timestamp;
    String firstTradeDate;

    Map<String, String> currencySigns;

    YahooPosition(JSONObject json) {
        this.json = json;

        JSONObject chart = json.getJSONObject("chart");
        JSONObject result = chart.getJSONArray("result").getJSONObject(0);
        JSONObject meta = result.getJSONObject("meta");
        JSONObject indicators = result.getJSONObject("indicators");
        JSONObject quote = indicators.getJSONArray("quote").getJSONObject(0);

        JSONArray timestamps = result.getJSONArray("timestamp");
        List<String> real_timestamps = new ArrayList<String>();
        for (int i = 0; i < timestamps.length(); i++) {
            long timestamp_value = timestamps.getLong(i);
            String new_timestamp = Instant.ofEpochSecond(timestamp_value).atZone(ZoneId.of("Europe/London")).toString();
            real_timestamps.add(new_timestamp);
        }
        this.timestamp = real_timestamps;


        // meta
        this.name = meta.getString("longName");
        this.ticker = meta.getString("symbol");
        this.timezone = meta.getString("timezone");
        this.range = meta.getString("range");
        this.currency = meta.getString("currency").toUpperCase();
        this.fiftyTwoWeekHigh = meta.getFloat("fiftyTwoWeekHigh");

        long ftd = meta.getLong("firstTradeDate");
        this.firstTradeDate = Instant.ofEpochSecond(ftd).atZone(ZoneId.of("Europe/London")).toString();


        // indicators
        this.volume = quote.getJSONArray("volume");
        this.high = quote.getJSONArray("high");
        this.low = quote.getJSONArray("low");
        this.close = quote.getJSONArray("close");
        this.open = quote.getJSONArray("open");

    }

    public void changeToday() {

    }

    // these will be used for printing for example $30 low/high
    public void makeCurrencyTable() {
        this.currencySigns = new HashMap<>();

        this.currencySigns.put("USD", "$");
        this.currencySigns.put("GBP", "£");
        this.currencySigns.put("EUR", "€");
        this.currencySigns.put("JPY", "¥");
        this.currencySigns.put("CNY", "¥");
        this.currencySigns.put("CAD", "C$");
        this.currencySigns.put("AUD", "A$");
        this.currencySigns.put("CHF", "CHF");
        this.currencySigns.put("SEK", "kr");
        this.currencySigns.put("NOK", "kr");
        this.currencySigns.put("DKK", "kr");
        this.currencySigns.put("PLN", "zł");
        this.currencySigns.put("INR", "₹");
        this.currencySigns.put("KRW", "₩");
    }

    public void print() {
        System.out.println("--- Yahoo Position ---");

        System.out.println("Name:             " + name);
        System.out.println("Ticker:           " + ticker);
        System.out.println("Currency:         " + currency);
        System.out.println("Timezone:         " + timezone);
        System.out.println("Range:            " + range);
        System.out.println("52 Week High:     " + fiftyTwoWeekHigh);
        System.out.println("First Trade Date: " + firstTradeDate);

        System.out.println();
        System.out.println("Market Data:");

        for (int i = 0; i < close.length(); i++) {
            String priceChange;
            String priceFlux;

            if (!close.isNull(i) && !open.isNull(i)) {
                long change = (close.getLong(i) - open.getLong(i));
                priceChange = Long.toString(change);
            } else {
                priceChange = "Error";
            }

            if (!high.isNull(i) && !low.isNull(i)) {
                long flux = (high.getLong(i) - low.getLong(i));
                priceFlux = Long.toString(flux);
            } else {
                priceFlux = "Error";
            }

            System.out.println(
                "Timestamp: " + timestamp.get(i) +
                " | Open: " + open.get(i) +
                " | High: " + high.get(i) +
                " | Low: " + low.get(i) +
                " | Close: " + close.get(i) +
                " | Volume: " + volume.get(i) +
                " | Price Change: " + priceChange +
                " | Price Fluxuation: " + priceFlux
            );
        }
    }

    public void printJson() {
        System.out.println(this.json.toString(4));
    }
}
