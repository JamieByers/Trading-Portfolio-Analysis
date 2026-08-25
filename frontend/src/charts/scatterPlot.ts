import { getData } from "../api";

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
