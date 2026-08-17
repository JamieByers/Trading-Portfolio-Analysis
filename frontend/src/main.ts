import * as echarts from "echarts";

async function getData(path: string) {
    let url = "http://localhost:8080"
    const response = await fetch(url+path);
    if (!response.ok) {
        throw new Error
    }

    let json = await response.json();

    return json
}

type Line = {
    timestamps: string[],
    closes: number[],
    changes: number[]
}

async function getAllData() {
    let all_data = await getData("/all")
    console.log(all_data);

    let lines: Line[] = []

    for (let obj of all_data) {
        let ypos = obj.yahooPosition
        let tels = ypos.timestamp_elements
        let line = await parse(tels)
        lines.push(line)
    }

    return lines
}


async function getTicker(ticker: string) {
    let json = await getData("/" + ticker)
    let ypos = json.yahooPosition
    let data = ypos.timestamp_elements

    return parse(data)
}



async function getTickers(tickers: string[]) {
    let lines: Line[] = []
    for (let ticker of tickers) {
        let line = await getTicker(ticker)
        lines.push(line)
    }

    return lines
}

async function parse(data) {
    let timestamps = []
    let closes  = []
    let changes = []

    for (let tel of data) {
        timestamps.push(tel.timestamp)
        closes.push(tel.close)
        changes.push(tel.priceChange)
    }

    let line: Line = {
        timestamps: timestamps,
        closes: closes,
        changes: changes
    }

    return line
}

async function createLineGraph() {
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

type CandleStickGraph = {
    timestamps: string[]
    data: number[][]
    full_data: any
    changes: number[]
    min: number
    max: number
}

async function getDetailedTicker(ticker: string) {
    let json = await getData("/" + ticker)
    let ypos = json.yahooPosition
    let tels = ypos.timestamp_elements
    console.log(tels)

    let timestamps = []
    let timestamp_data = []
    let changes = []

    let min = Math.min(tels[0].open, tels[0].close, tels[0].low, tels[0].high)
    let max = Math.max(tels[0].open, tels[0].close, tels[0].low, tels[0].high)

    for (let tel of tels) {
        timestamps.push(tel.timestamp.slice(0,10))
        let current_timestamp: number[] = [tel.open, tel.close, tel.low, tel.high]
        let possible_new_min = Math.min(...current_timestamp)
        let possible_new_max = Math.min(...current_timestamp)

        if (possible_new_min < min) { min = possible_new_min }
        if (possible_new_max > max) { max = possible_new_max }

        changes.push(tel.priceChange)
        timestamp_data.push(current_timestamp)
    }

    min = Math.floor(min)
    min -= min*0.15

    max = Math.ceil(max)
    max += max*0.15

    let csg: CandleStickGraph = {
        timestamps: timestamps,
        data: timestamp_data,
        full_data: json,
        changes: changes,
        min: min,
        max: max
    }

    return csg
}

async function createCandleStickGraph() {
    let csg = await getDetailedTicker("SNDK")
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
        },

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


let mychart = echarts.init(document.getElementById("chart"));

let option = await createCandleStickGraph();

mychart.setOption(option);

