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

type CandleStickGraph = {
    timestamps: string[],
    data: number[][]
}

async function getDetailedTicker(ticker: string) {
    let json = await getData("/" + ticker)
    let ypos = json.yahooPosition
    let tels = ypos.timestamp_elements

    let timestamps = []
    let timestamp_data = []

    for (let tel of tels) {
        timestamps.push(tel.timestamp)
        let current_timestamp = [tel.open, tel.close, tel.low, tel.high]
        timestamp_data.push(current_timestamp)
    }

    let csg: CandleStickGraph = {
        timestamps: timestamps,
        data: timestamp_data
    }

    return csg
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


let mychart = echarts.init(document.getElementById("chart"));


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

mychart.setOption(option);

