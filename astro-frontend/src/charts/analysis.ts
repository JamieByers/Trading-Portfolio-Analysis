export function calculateSD(timestamp_elements) {
    let total = 0;

    for (let te of timestamp_elements) {
        total += te.priceChangePercentage
    }

    let mean = total / timestamp_elements.length


    let sum_of_subtracted_means = 0;

    for (let t of timestamp_elements) {
        sum_of_subtracted_means += (t.priceChangePercentage - mean) ** 2;
    }

    return Math.sqrt(sum_of_subtracted_means / (timestamp_elements.length - 1))
}

export function getDate() {
    const today = new Date().toLocaleDateString("en-GB");
    return today
}

export function dateConversion(date: string) {
    return date.split("T")[0].split("-").reverse().join("/");
}

export function calculateTodayProfit(data) {
    let today = 0;
    for (let cp of data) {
        let tels = cp.yahooPosition.timestamp_elements;
        if (tels.length < 2) continue;

        const last = tels[tels.length - 1];
        const prev = tels[tels.length - 2];

        const date = getDate();
        if (dateConversion(last.timestamp) == date) {
            const changePct = (last.close - prev.close) / prev.close;

            const currentValue = cp.position.currentValue;
            const previousValue = currentValue / (1 + changePct);
            const profit = currentValue - previousValue;

            today += profit;
        }

    }
    return today;
}
