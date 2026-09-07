let cache = new Map<string, MonteCarloResult>

type MonteCarloResult = {
    simulations: number[][];
    current_value: number;
    min: number;
    max: number;
    starting_value: number;
};

export function generateMonteCarlo(combinedPosition, n_simulations: number, period: number, history: number) {
    let ticker = combinedPosition.yahooPosition.ticker
    let key = `${ticker}-s${n_simulations}-p${period}-h${history}`
    let cached_element = cache.get(key)

    console.log("cached_element: ", key, cached_element)
    if (cached_element) {
        return cached_element
    }

    console.log(combinedPosition, n_simulations, period)

    let timestamp_elements = combinedPosition.yahooPosition.timestamp_elements
    console.log("Generating monte carlo with n els", timestamp_elements.length)
    let percentageChanges = timestamp_elements.map((el) => el.priceChangePercentage / 100)
    let logPercentageChanges = percentageChanges.map(el => Math.log(1 + el))

    let total = 0
    for (let lpc of logPercentageChanges) {
        total += lpc
    }
    let mean = total / logPercentageChanges.length

    let variance = logPercentageChanges.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (logPercentageChanges.length - 1)

    let sd = Math.sqrt(variance)

    let current_value = timestamp_elements[timestamp_elements.length - 1].close

    let simulations = []

    let min = current_value;
    let max = current_value;

    for (let i=0; i < n_simulations; i++) {
        let running_value = current_value
        let simulation = [[0, running_value]]

        for (let day = 0; day < period; day++) {
            let randomReturn = mean + sd * randomNormal(); // Z ~ N(0,1)

            running_value *= Math.exp(randomReturn)

            if (running_value > max) {
                max = running_value
            }
            if (running_value < min) {
                min = running_value
            }

            simulation.push([day+1,running_value])
        }

        simulations.push(simulation)
    }

    console.log(simulations)

    let result = { simulations, current_value, min, max, starting_value: current_value }
    cache.set(key, result)

    return result

}

function randomNormal() {
    const u = 1 - Math.random()
    const v = 1 - Math.random()

    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
