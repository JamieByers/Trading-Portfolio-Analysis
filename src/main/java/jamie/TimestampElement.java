package jamie;

public class TimestampElement {
    public String timestamp;
    public long   volume;
    public double high;
    public double low;
    public double close;
    public double open;
    public double priceChange;
    public double priceChangePercentage;
    public double priceFlux;
    public String percentageMessage;

    public TimestampElement(String timestamp, double high, double low, double close, double open) {
        this.timestamp = timestamp;
        this.high = high;
        this.low = low;
        this.close = close;
        this.open = open;
    }
}
