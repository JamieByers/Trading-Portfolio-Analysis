import * as echarts from "echarts";
import { createCandleStickGraph } from "./charts/candleStickGraph"
import { generateMonteCarloGraph } from "./charts/lineChart";

const url = window.location.pathname
const levels = url.split("/")
const TICKER = levels[2]

const graphs = []

const mainStockGraphElement = document.getElementById("mainCandle")
const mainStockGraph = echarts.init(mainStockGraphElement);
const mainStockGraphOption = await createCandleStickGraph(TICKER, "?holdingTime=true&interval=1d")
mainStockGraph.setOption(mainStockGraphOption)
graphs.push(mainStockGraph)


const monteCarloElement = document.getElementById("monteCarloPageChart")

const ticker = monteCarloElement?.dataset.ticker
const period = 100;
const history = 100;
const n_simulations = 100

const monteCarloPageChart = echarts.init(monteCarloElement);
const monteCarloOption = await generateMonteCarloGraph(ticker, history, period, n_simulations)
monteCarloPageChart.setOption(monteCarloOption)
graphs.push(monteCarloPageChart)

export function resizeGraphs() {
    graphs.forEach(graph => {
        graph.resize();
    })
}

window.addEventListener("resize", () => {
    resizeGraphs()
})
