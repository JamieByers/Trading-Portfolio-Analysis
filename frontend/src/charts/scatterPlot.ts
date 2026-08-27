import { getData } from "../api";
import { calculateSD } from "./analysis";

export async function generateScatterPlotHoldingTimeUpl() {
    let all_data = await getData("/all");
    console.log(all_data)

    let holdingTime_upl= [];

    for (let cp of all_data) {
        let pos = cp.position
        holdingTime_upl.push([pos.createdAt, pos.upl])
    }

    console.log(holdingTime_upl)
    let option = {
            title: {
                text: "Holding Time vs Unrealised Profit/Loss"
            },

            tooltip: {
                position: [10,10]
            },

            series: [
                {
                    name: "name",
                    type: "scatter",
                    data: holdingTime_upl
                },

                {
                    name: 'line',
                    type: 'line',
                }
            ],

            xAxis: {
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            yAxis: {
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
    }

    return option;

}



export async function generateRiskReturnScatterplot() {
    let pot = await getData("/profit-over-time")
    let points = []

    for (let cp of pot) {
        let timestamp_elements = cp.yahooPosition.timestamp_elements
        let volatility = calculateSD(timestamp_elements)
        let profit = timestamp_elements[timestamp_elements.length-1].profit
        let ticker = cp.position.possibleYahooTicker

        points.push([volatility, profit, ticker])
    }

    console.log(points)

    let option = {
        title: {
            text: "Risk vs Return"
        },

        xAxis: {},
        yAxis: {},
        tooltip: {
            tooltip: {}
        },

        series: [
            {
                type: "scatter",
                data: points,
                label: {
                    show: true,
                    formatter: (params) => params.value[2],
                    position: "right"
                }
            }
        ]

    }

    return option
}
