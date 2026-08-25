import { getDetailedTicker } from "../api";

export async function createCandleStickGraph(ticker: string, params?) {
    let csg = await getDetailedTicker(ticker, params || "")
    let ypos = csg.full_data.yahooPosition
    console.log(csg.changes)

    let option = {
      title: { text: ypos.ticker + " " + ypos.name },
      legend: { type: "plain" },
      xAxis: {
        type: 'category',
        data: csg.timestamps
      },
      yAxis: [
        {
            type: 'value',
            min: csg.min,
            max: csg.max,
            axisLabel: {
                formatter: (value: number) => `£${value}`
            }
        },

        {
            type: "value",
            min: 0,
            max: 900,
            axisLabel: {
                formatter: (value: number) => `${value}`
            }
        }
      ],
      series: [
        {
            name: "Range",
            type: "candlestick",
            data: csg.data,
            yAxisIndex: 0,
            z: 1,
            itemStyle: {
                color0: "#ef232a",       // up
                color: "#14b143",      // down
                borderColor0: "#ef232a",
                borderColor: "#14b143"
            }},

        {
            name: "Change",
            type: "bar",
            data: csg.changes,
            yAxisIndex: 1,
            z: 2,

            itemStyle: {
                opacity: 0.2
            },
            barWidth: "30%"
        }
      ],
      tooltip: {
            position: [10, 10]
        }
    };

    return option
}
