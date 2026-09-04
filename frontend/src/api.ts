import * as types from "./types"

type Cache = Map<string, string>
let cache: Cache = new Map<string, string>()

export async function getData(path: string) {
    // let url = "/api"
    let url = "http://localhost:8080/api"

    if (cache.get(path) != null) { return cache.get(path) }

    const response = await fetch(url+path);
    console.log(response)
    if (!response.ok) {
        throw new Error()
    }

    let json = await response.json();

    cache.set(path, json)

    return json
}

type TodayElement = {
    position: any,
    todaypl: number,
    tpcp: number,
    change: number,
}

export async function getTodayElements() {
    let all_data = await getData("/all?range=24h&interval=1h")
    let todays_elements = []

    for (let cp of all_data) {
        let current_value = cp.position.currentValue;
        let before_value = current_value;
        let today_price_change_percentage = 0;
        let today_price_change = 0;

        for (let timestamp of cp.yahooPosition.timestamp_elements) {
            before_value /= 1 + (timestamp.priceChangePercentage / 100)
            today_price_change_percentage += timestamp.priceChangePercentage
            today_price_change += timestamp.priceChange;
        }

        let todaypl = current_value - before_value;

        let today: TodayElement = {
            position: cp,
            todaypl,
            tpcp: today_price_change_percentage,
            change: today_price_change
        }


        todays_elements.push(today);
    }

    return todays_elements;
}

// "2026-09-03T14:30+01:00[Europe/London]"
export async function getOnlyToday() {
    const today_date = new Date().toISOString().split("T")[0]; // 2026-09-04

    let all_data = await getData("/all?range=24h&interval=1h")
    let todays_elements = []

    for (let cp of all_data) {
        let current_value = cp.position.currentValue;
        let before_value = current_value;
        let today_price_change_percentage = 0;
        let today_price_change = 0;

        for (let timestamp of cp.yahooPosition.timestamp_elements) {
            console.log(timestamp.timestamp.split("T")[0], today_date)
            if (timestamp.timestamp.split("T")[0] != today_date) { continue }
            before_value /= 1 + (timestamp.priceChangePercentage / 100)
            today_price_change_percentage += timestamp.priceChangePercentage
            today_price_change += timestamp.priceChange;
        }

        let todaypl = current_value - before_value;

        let today: TodayElement = {
            position: cp,
            todaypl,
            tpcp: today_price_change_percentage,
            change: today_price_change
        }


        todays_elements.push(today);
    }

    return todays_elements;
}

getOnlyToday()

export async function parseParams(path: string) {
    let split_path = path.split("?")
    let real_path = split_path[0]
    let params = split_path[1].split("&")

    return [real_path, params]

}


export async function getAllData() {
    let all_data = await getData("/all")

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


export async function getDetailedTicker(ticker: string, params?: string) {
    params ??= window.location.search || "?interval=1h&range=1wk"

    let json = await getData("/" + ticker + params)
    let ypos = json.yahooPosition
    let tels = ypos.timestamp_elements

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
