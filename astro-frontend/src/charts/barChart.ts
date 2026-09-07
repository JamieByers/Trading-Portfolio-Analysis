import { getData } from "../api"
import { calculateSD } from "./analysis";

export async function topChart() {
    let all_data = await getData("/all")

    let personal_positons = []
    for ( let pos of all_data ) {
        let p = pos.position;
        personal_positons.push(p)
    }

    personal_positons.sort((a,b) => b.upl - a.upl)

    let axis_labels = []
    let data = []

    for ( let i = 0; i < 5; i++) {
        axis_labels.push(personal_positons[i].name)
        data.push(personal_positons[i].upl)
    }

    let option = {
        title: {
            text: "Top Winners"
        },
        xAxis: {
            type: "value"
        },
        yAxis: {
            type: "category",
            data: axis_labels.reverse()
        },
        series: [{
            type: "bar",
            data: data.reverse()
        }]
    }

    return option
}


export async function generateVolatilityGraph() {
    let all_data = await getData("/all?range=365d&interval=1d");
    let data = []
    let xAxis = []
    let days365 = []
    let days90 = []
    let days30 = []
    let days7 = []

    for (let cp of all_data) {
        let timestamp_elements = cp.yahooPosition.timestamp_elements
        let n = timestamp_elements.length

        let sd365 = calculateSD(timestamp_elements)
        let sd90 = calculateSD(timestamp_elements.slice(n-90, n))
        let sd30 = calculateSD(timestamp_elements.slice(n-30, n))
        let sd7 = calculateSD(timestamp_elements.slice(n-7, n))

        data.push({
            "ticker":cp.position.possibleYahooTicker,
            "sd365": sd365,
            "sd90": sd90,
            "sd30": sd30,
            "sd7": sd7,
        })
    }

    data.sort((a, b) => b.sd365 - a.sd365)
    console.log(data)

    for (let el of data) {
        if (el.sd365 > 0) {
            xAxis.push(el.ticker)
            days365.push(el.sd365)
            days90.push(el.sd90)
            days30.push(el.sd30)
            days7.push(el.sd7)
        }
    }

    let option = {
        title: {
            text: "Volatility over the last year"
        },

        xAxis: {
            type: "category",
            data: xAxis,
            axisLabel: {
                interval: 0
            }
        },

        yAxis: {
            type: "value",
        },

        series: [
            {
                type: "bar",
                name: "365 Days",
                data: days365
            },
            {
                type: "bar",
                name: "90 Days",
                data: days90
            },
            {
                type: "bar",
                name: "30 Days",
                data: days30
            },
            {
                type: "bar",
                name: "7 Days",
                data: days7
            },
        ],

        tooltip: {}

    }

    return option
}

