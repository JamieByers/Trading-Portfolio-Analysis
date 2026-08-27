import * as echarts from "echarts";

import { createCandleStickGraph } from "./charts/candleStickGraph.ts"
import { createPieChart } from "./charts/pieChart.ts"
import { generateVolatilityGraph, topChart } from "./charts/barChart.ts"
import { portfolioOverTime, profitOverTime } from "./charts/lineChart.ts"
import { topLosersToday, topMoversToday, topWinnersToday } from "./charts/topToday.ts"
import { generateRiskReturnScatterplot, generateScatterPlotHoldingTimeUpl } from "./charts/scatterPlot.ts";

let now = Date.now()

let current_path = window.location.pathname.split("/")
let params = window.location.search
console.log(current_path)
console.log(params)

let path: string;
if (current_path[1] != "" ) { path = current_path[1] } else { path = "SNDK" }

let mainCandleStickGraph = echarts.init(document.getElementById("chart"));

const loading = document.querySelector(".loading") as HTMLElement;
let option = await createCandleStickGraph(path, "?range=1mo&interval=1d");
loading.style.display = "none";

mainCandleStickGraph.setOption(option);

let primaryTickerInput = document.getElementById("primaryTickerInput") as HTMLInputElement
let primaryRangeInput = document.getElementById("primaryRangeInput") as HTMLInputElement
let primaryIntervalInput = document.getElementById("primaryIntervalInput") as HTMLInputElement


[primaryTickerInput, primaryRangeInput, primaryIntervalInput].forEach((el: HTMLInputElement) => {
    el.addEventListener("input", async () => {
        await resetCandleGraph(primaryTickerInput.value, primaryRangeInput.value, primaryIntervalInput.value, mainCandleStickGraph)
    })
});

let pieChart = echarts.init(document.getElementById("pieChart"))
let pie_option = await createPieChart()

pieChart.setOption(pie_option)


let topLosersChartElement = echarts.init(document.getElementById("topChart"))
let tlc_option = await topChart()

topLosersChartElement.setOption(tlc_option)


let portfolioOvertime = echarts.init(document.getElementById("portfolioOverTime"))
let pot = await portfolioOverTime()
portfolioOvertime.setOption(pot)


let topWinnersTodayChart = echarts.init(document.getElementById("topWinnersToday"))
let tt = await topWinnersToday()

topWinnersTodayChart.setOption(tt)

let topLosersTodayChart = echarts.init(document.getElementById("topLosersToday"))
let tl = await topLosersToday()

topLosersTodayChart.setOption(tl)

let topMoversTodayChart = echarts.init(document.getElementById("topMoversToday"))
let tm = await topMoversToday()

topMoversTodayChart.setOption(tm)


let compare1 = document.getElementById("compareInput1") as HTMLInputElement
let compare2 = document.getElementById("compareInput2") as HTMLInputElement

let range1 = document.getElementById("rangeInput1") as HTMLInputElement
let range2 = document.getElementById("rangeInput2") as HTMLInputElement

let interval1 = document.getElementById("intervalInput1") as HTMLInputElement
let interval2 = document.getElementById("intervalInput2") as HTMLInputElement

let compareTickerValue1 = compare1.value || "SNDK"
let compareTickerValue2 = compare2.value || "ASML"

let candleCompare1 = echarts.init(document.getElementById("compareLeft"));
let cc1o = await createCandleStickGraph(compareTickerValue1);
candleCompare1.setOption(cc1o);

let candleCompare2 = echarts.init(document.getElementById("compareRight"));
let cc2o = await createCandleStickGraph(compareTickerValue2);
candleCompare2.setOption(cc2o);

async function resetCandleGraph(ticker: string, range: string, interval: string, chart: echarts.ECharts) {
    ticker = ticker || "SNDK"
    range = range || "1mo"
    interval = interval || "1d"

    let path: string = ticker + "?range=" + range + "&interval=" + interval
    console.log(path)

    let option = await createCandleStickGraph(path);
    chart.setOption(option)
}

[compare1, range1, interval1].forEach((el: HTMLInputElement) => {
    el.addEventListener("input", async () => {
        await resetCandleGraph(compare1.value, range1.value, interval1.value, candleCompare1)
    })
});

[compare2, range2, interval2].forEach((el: HTMLInputElement) => {
    el.addEventListener("input", async () => {
        await resetCandleGraph(compare2.value, range2.value, interval2.value, candleCompare2)
    })
});


// let holdingTimeAndReturn = echarts.init(document.getElementById("holdingTimeAndReturn"))
// let holdingTimeAndReturnOption = await generateScatterPlotHoldingTimeUpl();
// holdingTimeAndReturn.setOption(holdingTimeAndReturnOption)

let profitOverTimeGraph = echarts.init(document.getElementById("profitOverTime"))
let profitOverTimeOption = await profitOverTime();
profitOverTimeGraph.setOption(profitOverTimeOption)

let volatilityOverTime = echarts.init(document.getElementById("volatilityOverTime"))
let volatilityOverTimeOption = await generateVolatilityGraph();
volatilityOverTime.setOption(volatilityOverTimeOption)

let riskReturnGraph = echarts.init(document.getElementById("riskReturnGraph"))
let riskReturnGraphOption = await generateRiskReturnScatterplot();
riskReturnGraph.setOption(riskReturnGraphOption)

window.addEventListener("resize", () => {
    mainCandleStickGraph.resize()
    pieChart.resize()
    topLosersChartElement.resize()
    portfolioOvertime.resize()
    topWinnersTodayChart.resize()
    topLosersTodayChart.resize()
    topMoversTodayChart.resize()
    candleCompare1.resize()
    candleCompare2.resize()
    portfolioOvertime.resize()
    volatilityOverTime.resize()
    riskReturnGraph.resize()
})

let then = Date.now()
let elapsed = (then - now) / 1000
console.log("Time Elapsed to fetch website: " + elapsed)
