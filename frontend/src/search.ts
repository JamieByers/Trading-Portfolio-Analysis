import * as echarts from "echarts";
import { getData } from "./api";
import { createCandleStickGraph } from "./charts/candleStickGraph";

const positions = await getData("/positions")
const widgets = document.getElementById("widgets")

let widgetMap = {}

for (let position of positions) {
    let widget = document.createElement("div");
    widget.classList.add("widget")
    const locationTicker = position.ticker.split(".")[0]

    widget.addEventListener("click", () => {
        window.location.href = "/page/" + locationTicker
    })

    widgets.appendChild(widget)


    const candleStickGraph = echarts.init(widget)
    const candleStickGraphOption = await createCandleStickGraph(position.ticker, "?range=1d&interval=1h");
    // candleStickGraphOption["title"] = null
    candleStickGraph.setOption(candleStickGraphOption)

}

