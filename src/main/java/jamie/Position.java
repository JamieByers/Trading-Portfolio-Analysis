package jamie;

import org.json.JSONObject;

import java.util.HashMap;

public class Position {
    public float quantityAvailableForTrading;
    public String createdAt;
    public float quantityInPies;
    public float averagePricePaid;
    public float quantity;
    public float currentPrice;
    public String ticker;
    public String possibleYahooTicker;
    public String name;
    public String stockCurrency;
    public String isin;
    public float fxImpact;
    public String walletCurrency;
    public float totalCost;
    public float currentValue;
    public float upl; // unrealised profit/loss

    public void parse(JSONObject o) {
        this.quantityAvailableForTrading = o.getFloat("quantityAvailableForTrading");
        this.quantity = o.getFloat("quantity");
        this.createdAt = o.getString("createdAt");
        this.quantityInPies = o.getFloat("quantityInPies");
        this.averagePricePaid = o.getFloat("averagePricePaid");
        this.currentPrice = o.getFloat("currentPrice");

        //instrument
        JSONObject instrument = o.getJSONObject("instrument");

        this.ticker = instrument.getString("ticker");
        yahooTicker(this.ticker);
        this.name = instrument.getString("name");
        this.stockCurrency = instrument.getString("currency");
        this.isin = instrument.getString("isin");

        // walletImpact
        JSONObject walletImpact = o.getJSONObject("walletImpact");

        this.fxImpact = walletImpact.optFloat("fxImpact", 0.00f);
        this.walletCurrency = walletImpact.getString("currency");
        this.totalCost = walletImpact.getFloat("totalCost");
        this.currentValue = walletImpact.getFloat("currentValue");
        this.upl = walletImpact.optFloat("unrealizedProfitLoss", 0.0f);
    }

    public void print() {
        System.out.println("Position");
        System.out.println("--------");
        System.out.println("Ticker:             " + ticker + " | " + possibleYahooTicker);
        System.out.println("Name:               " + name);
        System.out.println("ISIN:               " + isin);
        System.out.println("Stock Currency:     " + stockCurrency);
        System.out.println("Wallet Currency:    " + walletCurrency);
        System.out.println("Created At:         " + createdAt);
        System.out.println();
        System.out.println("Quantity:           " + quantity);
        System.out.println("Quantity in Pies:   " + quantityInPies);
        System.out.println("Available:          " + quantityAvailableForTrading);
        System.out.println("Average Price:      " + averagePricePaid);
        System.out.println("Current Price:      " + currentPrice);
        System.out.println();
        System.out.println("Total Cost:         " + totalCost);
        System.out.println("Current Value:      " + currentValue);
        System.out.println("P/L:                " + upl);
        System.out.println("FX Impact:          " + fxImpact);
    }


    public void yahooTicker(String ticker) {
        String[] parts = ticker.split("_");
        String real_ticker = parts[0];
        real_ticker = real_ticker.replaceAll("[0-9]", "");

        String market = "";
        String suffix = real_ticker.replaceAll("^[A-Z0-9]+", "");
        if (suffix != "") {
            HashMap<String, String> lookup = marketLookupTable();
            market = lookup.getOrDefault(suffix, "."+suffix.toUpperCase());
        }

        real_ticker = real_ticker.replaceAll("[a-z]", "");
        real_ticker = real_ticker + market;

        this.possibleYahooTicker = real_ticker;
    }

    public HashMap<String, String>  marketLookupTable() {
        HashMap<String, String> lookup = new HashMap<String, String>() ;

        lookup.put("l", ".L");  // LSE
        lookup.put("a", ".AS"); // AMS
        lookup.put("f", ".F"); // AMS

        return lookup;
    }

}
