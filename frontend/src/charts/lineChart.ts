import { getData, getAllData } from "../api"
import { generateMonteCarlo } from "./monteCarlo";

export async function portfolioOverTime() {
    let all_data = await getData("/all")

    let personal_positons = []

    for ( let pos of all_data ) {
        let p = pos.position;
        personal_positons.push(p)

    }

    personal_positons.sort((a,b) => b.holdingTimeValue - a.holdingTimeValue)

    let cost = []
    let total_cost = 0
    let ca = []

    for ( let pp of personal_positons ) {
        total_cost += pp.totalCost
        cost.push(total_cost)

        let date = pp.createdAt.slice(0,10).split("-")
        ca.push(date[2] + "/" + date[1] + "/" + date[0])
    }

    let option = {
        title: {
            text: "Estimate Investments Over Time"
        },

        yAxis: {
            type: "value",
            axisLabel: {
                show: false
            },
            axisLine: {
                show: true
            }
        },
        xAxis: {
            type: "category",
            data: ca
        },

        series: [{
            type: "line",
            data: cost,
        }],
        tooltip: {
            position: [10, 10]
        }
    }

    return option

}


export async function createLineGraph() {
    // let lines = await getTickers(tickers)
    let lines = await getAllData()
    let timestamps = []
    if (lines.length > 0) {
        timestamps = lines[0].timestamps
    }

    let series = []

    for (let line of lines)  {
        series.push({
            series: line.changes,
            type: 'line'
        })
    }

    let option = {
      xAxis: {
        type: 'category',
        series: timestamps
      },
      yAxis: {
        type: 'value'
      },
      series: series,

    };

    return option
}


export async function profitOverTime() {
    let all_data = await getData("/profit-over-time")

    let series = [];
    let profitMap = new Map<string, number>();

    for (let cp of all_data) {
        let ticker_data = {
            name: cp.position.name,
            type: "line",
            data: [],
            showSymbol: false,
            emphasis: {
                focus: "series"
            }
        }

        for (let te of cp.yahooPosition.timestamp_elements) {
            let ts = te.timestamp.split("[")[0]
            ticker_data.data.push([ts, te.profit])
            if (profitMap.has(ts)) {
                profitMap.set(ts, profitMap.get(ts)! + te.profit);
            } else {
                profitMap.set(ts, te.profit);
            }
        }
        series.push(ticker_data)
    }

    let totalProfitData = [...profitMap.entries()].sort(([a], [b]) => a.localeCompare(b));

    let option = {
        title: {
            text: "Profit Over Time"
        },
        yAxis: {
            type: "value"
        },
        xAxis: {
            type: "time",
            axisLabel: {
                hideOverlap: true,
                interval: "auto"
            }
        },

        tooltip: {
            trigger: "axis"
        },

        series: [
            ...series,

            {
                name: "Total Profit",
                data: totalProfitData,
                type: "line",
                showSymbol: false,

                lineStyle: {
                    winth: 4
                },
                z: 10,

                emphasis: {
                    focus: "series"
                }

            },
        ],

        dataZoom: [
            {
                type: "inside",
                start: 0,
                end: 100
            },
            {
                type: "slider",
                start: 0,
                end: 100,
                height: 20,
                bottom: 5
            }
        ]
    }

    console.log(option)

    return option
}


export async function generateMonteCarloGraph(ticker: string, history: number, period: number, n_simulations: number) {
    ticker = ticker || "SNDK"
    history = history || 100
    period = period || 100
    n_simulations = n_simulations || 100

    let stock = await getData("/" + ticker + "?range=" + history + "d&interval=1d" + "/exact")

    let { simulations, current_value, min, max, starting_value } = generateMonteCarlo(stock, n_simulations, period, history)
    let lines = []

    for (let simulation of simulations) {
        lines.push({
            type: "line",
            data: simulation,
            lineStyle: {
                opacity: 0.3,
                width: 2
            },

            showSymbol: false
        })

    }

    let option = {
        title: {
            text: "Monte Carlo Simulation: " + stock.yahooPosition.ticker + " " + stock.yahooPosition.name
        },

        xAxis: {
            type: "value",
            name: "Days",
        },

        yAxis: {
            type: "value",
            name: "Price",
            min: min * 0.9,
            max: max * 1.1,
        },

        series: [
            ...lines,
            {
                type: "line",
                data: [
                    [0, current_value],
                    [period, current_value]
                ],
                lineStyle: {
                    width: 4,
                    color: "grey"
                },
            }
        ]

    }

    return option


}
