import * as echarts from "echarts";

import { createCandleStickGraph } from "./charts/candleStickGraph.ts"
import { createPieChart } from "./charts/pieChart.ts"
import { generateVolatilityGraph, topChart } from "./charts/barChart.ts"
import { generateMonteCarloGraph, portfolioOverTime, profitOverTime } from "./charts/lineChart.ts"
import { topLosersToday, topMoversToday, topWinnersToday } from "./charts/topToday.ts"
import { generateRiskReturnScatterplot } from "./charts/scatterPlot.ts";
import { generateStockTable } from "./charts/table.ts";


const now = Date.now()

const current_path = window.location.pathname.split("/")

console.log(window.location)
console.log(current_path)

let path: string;
if (current_path.length >= 3 &&
    current_path[1].toLowerCase() == "ticker" &&
    current_path[2] != "") {

    path = current_path[2]
} else {
    path = "SNDK"
}

const mainCandleStickGraph = echarts.init(document.getElementById("chart"));
const loading = document.querySelector(".loading") as HTMLElement;

const mainCandleStickOption = await createCandleStickGraph(path, "?range=1mo&interval=1d");

loading.style.display = "none";
mainCandleStickGraph.setOption(mainCandleStickOption);


const primaryTickerInput = document.getElementById("primaryTickerInput") as HTMLInputElement
const primaryRangeInput = document.getElementById("primaryRangeInput") as HTMLInputElement
const primaryIntervalInput = document.getElementById("primaryIntervalInput") as HTMLInputElement


[primaryTickerInput, primaryRangeInput, primaryIntervalInput].forEach((el: HTMLInputElement) => {
    el.addEventListener("input", async () => {
        await resetCandleGraph(primaryTickerInput.value, primaryRangeInput.value, primaryIntervalInput.value, mainCandleStickGraph)
    })
});

// ------------------------------------------------------


const pieChart = echarts.init(document.getElementById("pieChart"))
const pieChartOption = await createPieChart()
pieChart.setOption(pieChartOption)


const topWinnersChartElement = echarts.init(document.getElementById("topChart"))
const topWinnersChartOption = await topChart()

topWinnersChartElement.setOption(topWinnersChartOption)


const portfolioOvertime = echarts.init(document.getElementById("portfolioOverTime"))
const portfolioOverTimeOption = await portfolioOverTime()
portfolioOvertime.setOption(portfolioOverTimeOption)

// ------------------------------------------------------

const topWinnersTodayElement = document.getElementById("topWinnersToday")
const topWinnersTodayChart = echarts.init(topWinnersTodayElement)
let hours_or_days_winners = false;

let top_winners_today = await topWinnersToday(hours_or_days_winners)
topWinnersTodayChart.setOption(top_winners_today)

topWinnersTodayElement.addEventListener("click", async () => {
    hours_or_days_winners = !hours_or_days_winners
    top_winners_today = await topWinnersToday(hours_or_days_winners)
    topWinnersTodayChart.setOption(top_winners_today)
})


const topLosersTodayElement = document.getElementById("topLosersToday")
const topLosersTodayChart = echarts.init(topLosersTodayElement)
let hours_or_days_losers = false;

let top_losers_today = await topLosersToday(hours_or_days_losers)
topLosersTodayChart.setOption(top_losers_today)

topLosersTodayElement.addEventListener("click", async () => {
    hours_or_days_losers = !hours_or_days_losers
    top_losers_today = await topLosersToday(hours_or_days_losers)
    topLosersTodayChart.setOption(top_losers_today)
})


const topMoversTodayElement = document.getElementById("topMoversToday")
const topMoversTodayChart = echarts.init(topMoversTodayElement)
let hours_or_days_movers = false

let top_movers_today = await topMoversToday()
topMoversTodayChart.setOption(top_movers_today);

topMoversTodayElement.addEventListener("click", async () => {
    hours_or_days_movers = !hours_or_days_movers
    top_movers_today = await topMoversToday(hours_or_days_movers)
    topMoversTodayChart.setOption(top_movers_today)
})




// ------------------------------------------------------


const compare1 = document.getElementById("compareInput1") as HTMLInputElement
const compare2 = document.getElementById("compareInput2") as HTMLInputElement

const range1 = document.getElementById("rangeInput1") as HTMLInputElement
const range2 = document.getElementById("rangeInput2") as HTMLInputElement

const interval1 = document.getElementById("intervalInput1") as HTMLInputElement
const interval2 = document.getElementById("intervalInput2") as HTMLInputElement

const compareTickerValue1 = compare1.value || "SNDK"
const compareTickerValue2 = compare2.value || "ASML"

const candleCompare1 = echarts.init(document.getElementById("compareLeft"));
const cc1o = await createCandleStickGraph(compareTickerValue1);
candleCompare1.setOption(cc1o);

const candleCompare2 = echarts.init(document.getElementById("compareRight"));
const cc2o = await createCandleStickGraph(compareTickerValue2);
candleCompare2.setOption(cc2o);

async function resetCandleGraph(ticker: string, range: string, interval: string, chart: echarts.ECharts) {
    ticker = ticker || "SNDK"
    range = range || "1mo"
    interval = interval || "1d"

    const path: string = ticker + "?range=" + range + "&interval=" + interval
    console.log(path)

    const mainCandleStickOption = await createCandleStickGraph(path);
    chart.setOption(mainCandleStickOption)
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

// ------------------------------------------------------

const profitOverTimeGraph = echarts.init(document.getElementById("profitOverTime"))
const profitOverTimeOption = await profitOverTime();
profitOverTimeGraph.setOption(profitOverTimeOption)

// ------------------------------------------------------

const volatilityOverTime = echarts.init(document.getElementById("volatilityOverTime"))
const volatilityOverTimeOption = await generateVolatilityGraph();
volatilityOverTime.setOption(volatilityOverTimeOption)

// ------------------------------------------------------

const riskReturnGraph = echarts.init(document.getElementById("riskReturnGraph"))
const riskReturnGraphOption = await generateRiskReturnScatterplot();
riskReturnGraph.setOption(riskReturnGraphOption)

// ------------------------------------------------------

const monteCarloGraph = echarts.init(document.getElementById("monteCarloGraph"))
const monteCarloGraphOption = await generateMonteCarloGraph("SNDK", 100, 100, 100);
monteCarloGraph.setOption(monteCarloGraphOption)

const monteCarloTicker = document.getElementById("monteCarloTickerInput") as HTMLInputElement;
const monteCarloHistory = document.getElementById("monteCarloHistoryInput") as HTMLInputElement;
const monteCarloPeriod = document.getElementById("monteCarloPeriodInput") as HTMLInputElement;
const monteCarloNSimulations = document.getElementById("monteCarloNSimulationsInput") as HTMLInputElement;
[monteCarloTicker, monteCarloHistory, monteCarloPeriod, monteCarloNSimulations].forEach((el: HTMLInputElement) => {
    el.addEventListener("input", async () => {
        const mainCandleStickOption = await generateMonteCarloGraph(monteCarloTicker.value, Number(monteCarloHistory.value), Number(monteCarloPeriod.value), Number(monteCarloNSimulations.value))
        monteCarloGraph.setOption(mainCandleStickOption, {notMerge: true})
    })
});

// ------------------------------------------------------

generateStockTable()

// ------------------------------------------------------

window.addEventListener("resize", () => {
    mainCandleStickGraph.resize()
    pieChart.resize()
    topWinnersChartElement.resize()
    portfolioOvertime.resize()
    topWinnersTodayChart.resize()
    topLosersTodayChart.resize()
    topMoversTodayChart.resize()
    candleCompare1.resize()
    candleCompare2.resize()
    volatilityOverTime.resize()
    riskReturnGraph.resize()
    monteCarloGraph.resize()
})

const then = Date.now()
const elapsed = (then - now) / 1000
console.log("Time Elapsed to fetch website: " + elapsed)
