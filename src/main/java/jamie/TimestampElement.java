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
    public double profit;

    public TimestampElement(String timestamp, double open, double close, double low, double high) {
        this.timestamp = timestamp;
        this.open = open;
        this.close = close;
        this.low = low;
        this.high = high;

        this.priceChange = this.close - this.open;
        this.percentageMessage = Double.toString(this.priceChange);

        this.priceChangePercentage = (this.priceChange / this.open) * 100;

        this.percentageMessage = String.format(" (%.2f%%)", this.priceChangePercentage);

        this.priceFlux = (this.high - this.low);
    }
}
