import * as echarts from "echarts";
import { createCandleStickGraph } from "./charts/candleStickGraph"
import { generateMonteCarloGraph } from "./charts/lineChart";

const url = window.location.pathname
const levels = url.split("/")
const TICKER = levels[2]

console.log(url)
console.log(levels)

const graphs = []

const mainStockGraphElement = document.getElementById("mainCandle")
const mainStockGraph = echarts.init(mainStockGraphElement);
const mainStockGraphOption = await createCandleStickGraph(TICKER, "?holdingTime=true&interval=1d")
mainStockGraph.setOption(mainStockGraphOption)
graphs.push(mainStockGraph)

window.addEventListener("resize", () => {
    graphs.forEach(graph => {
        graph.resize();
    })
})


// const monteCarloElement = document.getElementById("monteCarloPageChart")
// const monteCarloPageChart = echarts.init(monteCarloElement);
// const monteCarloOption = await generateMonteCarloGraph(TICKER, "?holdingTime=true&interval=1d")
// mainStockGraph.setOption(mainStockGraphOption)
// graphs.push(mainStockGraph)

// window.addEventListener("resize", () => {
//     graphs.forEach(graph => {
//         graph.resize();
//     })
// })
