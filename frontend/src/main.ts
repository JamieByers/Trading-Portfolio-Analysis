import * as echarts from "echarts";

import { createCandleStickGraph } from "./charts/candleStickGraph.ts"
import { createPieChart } from "./charts/pieChart.ts"
import { topChart } from "./charts/barChart.ts"
import { portfolioOverTime } from "./charts/lineChart.ts"
import { topLosersToday, topMoversToday, topWinnersToday } from "./charts/topToday.ts"

let now = Date.now()

let current_path = window.location.pathname.split("/")
let params = window.location.search
console.log(current_path)
console.log(params)

let path: string;
if (current_path[1] != "" ) { path = current_path[1] } else { path = "SNDK" }

let linegraph = echarts.init(document.getElementById("chart"));

const loading = document.querySelector(".loading") as HTMLElement;
let option = await createCandleStickGraph(path);
loading.style.display = "none";

linegraph.setOption(option);


let pieChart = echarts.init(document.getElementById("pieChart"))
let pie_option = await createPieChart()

pieChart.setOption(pie_option)


let topLosersChartElement = echarts.init(document.getElementById("topChart"))
let tlc_option = await topChart()

topLosersChartElement.setOption(tlc_option)


let portfolioOvertime = echarts.init(document.getElementById("portfolioOverTime"))
let pot = await portfolioOverTime()

portfolioOvertime.setOption(pot)


let twd = echarts.init(document.getElementById("topWinnersToday"))
let tt = await topWinnersToday()

twd.setOption(tt)

let tld = echarts.init(document.getElementById("topLosersToday"))
let tl = await topLosersToday()

tld.setOption(tl)

let tmd = echarts.init(document.getElementById("topMoversToday"))
let tm = await topMoversToday()

tmd.setOption(tm)

let then = Date.now()
let elapsed = (then - now) / 1000
console.log("Time Elapsed to fetch website: " + elapsed)
