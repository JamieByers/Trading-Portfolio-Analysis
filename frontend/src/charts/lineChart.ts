import { getData, getAllData } from "../api"

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
            data: line.changes,
            type: 'line'
        })
    }

    let option = {
      xAxis: {
        type: 'category',
        data: timestamps
      },
      yAxis: {
        type: 'value'
      },
      series: series,

    };

    return option
}
