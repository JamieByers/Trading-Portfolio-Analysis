import { getDetailedTicker } from "../api";

export async function createCandleStickGraph(ticker: string, params?: string) {
    let csg = await getDetailedTicker(ticker, params || "")
    let ypos = csg.full_data.yahooPosition
    let data = csg.data

    const linear = linearRegression(data.map(el => el[1]))

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
            data: data,
            yAxisIndex: 0,
            z: 1,
            itemStyle: {
                color0: "#ef232a",     // up
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
        },
        {
            name: "Trend",
            type: "line",
            data: linear,
            symbol: "none",
            lineStyle: {
                opacity: 0.05,
                color: "blue",
            },
            emphasis: {
                lineStyle: {
                    opacity: 1,
                    width: 2
                }
            },
            z: -1
        }
      ],
      tooltip: {
            position: [10, 10]
        }
    };

    return option
}


function linearRegression(data: number[]) {
    const n = data.length;

    const xMean = (n - 1) / 2;
    const yMean = data.reduce((sum, y) => sum + y, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let x = 0; x < n; x++) {
        numerator += (x - xMean) * (data[x] - yMean);
        denominator += (x - xMean) ** 2;
    }

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    return data.map((_, x) => intercept + slope * x);
}
