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
