package jamie;

import com.fasterxml.jackson.databind.ObjectMapper;

public class CombinedPosition {
    public Position position;
    public YahooPosition yahooPosition;

    CombinedPosition(Position position, YahooPosition yahooPosition) {
        this.position = position;
        this.yahooPosition = yahooPosition;
    }

    public void print() {
        position.print();
        yahooPosition.print();
    }

    public String toJson() throws Exception {
        return new ObjectMapper().writeValueAsString(this);
    }

}
