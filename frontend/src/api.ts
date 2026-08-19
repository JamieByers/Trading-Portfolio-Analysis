import * as types from "./types"

export async function getData(path: string) {
    let url = "http://localhost:8080"
    const response = await fetch(url+path);
    if (!response.ok) {
        throw new Error
    }

    let json = await response.json();

    return json
}


export async function getAllData() {
    let all_data = await getData("/all")
    console.log(all_data);

    let lines: types.Line[] = []

    for (let obj of all_data) {
        let ypos = obj.yahooPosition
        let tels = ypos.timestamp_elements
        let line = await parse(tels)
        lines.push(line)
    }

    return lines
}



export async function getTicker(ticker: string) {
    let json = await getData("/" + ticker)
    let ypos = json.yahooPosition
    let data = ypos.timestamp_elements

    return parse(data)
}

export async function parse(data) {
    let timestamps = []
    let closes  = []
    let changes = []

    for (let tel of data) {
        timestamps.push(tel.timestamp)
        closes.push(tel.close)
        changes.push(tel.priceChange)
    }

    let line: types.Line = {
        timestamps: timestamps,
        closes: closes,
        changes: changes
    }

    return line
}


export async function getTickers(tickers: string[]) {
    let lines: types.Line[] = []
    for (let ticker of tickers) {
        let line = await getTicker(ticker)
        lines.push(line)
    }

    return lines
}


export async function getDetailedTicker(ticker: string) {
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

    let csg: types.CandleStickGraph = {
        timestamps: timestamps,
        data: timestamp_data,
        full_data: json,
        changes: changes,
        min: min,
        max: max
    }

    return csg
}
