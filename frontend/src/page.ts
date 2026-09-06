import * as echarts from "echarts";
import { createCandleStickGraph } from "./charts/candleStickGraph"

const url = window.location.pathname
const levels = url.split("/")
const TICKER = levels[2]

console.log(url)
console.log(levels)

const graphs = []

const mainStockGraphElement = document.getElementById("mainStockGraph")
const mainStockGraph = echarts.init(mainStockGraphElement);
const mainStockGraphOption = await createCandleStickGraph(TICKER, "?holdingTime=true&interval=1d")
mainStockGraph.setOption(mainStockGraphOption)
graphs.push(mainStockGraph)

window.addEventListener("resize", () => {
    graphs.forEach(graph => {
        graph.resize();
    })
})

