import * as echarts from "echarts";
import { getData } from "./api";
import { createCandleStickGraph } from "./charts/candleStickGraph.ts";


const positions = await getData("/positions")
const widgets = document.getElementById("widgets")

type Widget = {
    ticker: string,
    dom: HTMLElement,
    pos: any,
    chart: any
}

let widgetsArray: Widget[] = []
let charts = []

async function createWidget(position) {
    let widget = document.createElement("div");
    widget.classList.add("widget")
    const locationTicker = position.ticker.split(".")[0]

    widget.addEventListener("click", () => {
        window.location.href = "/page/" + locationTicker
    })

    widget.innerHTML = `
            <h1 class="widgetTitle">${position.name + " | " + position.ticker}</h1>
            <div class="widgetChart"></div>
        `

    widgets.appendChild(widget)

    const chartElement = widget.querySelector(".widgetChart") as HTMLElement

    const chart = echarts.init(chartElement)
    const option = await createCandleStickGraph(
        position.ticker, "?range=1d&interval=15m"
    );
    delete option.legend
    delete option.title
    chart.setOption(option)

    charts.push(chart)
    widgetsArray.push({
        ticker: position.ticker,
        dom: widget,
        pos: position,
        chart,
    })
}

async function createWidgets() {
    for (let position of positions) {
        await createWidget(position);
    }

    window.addEventListener("resize", () => {
        charts.forEach(chart => chart.resize())
    })
}


createWidgets();

function filterWidgets(widgetsArray, search: string) {
    for (let widget of widgetsArray) {
        if (!widget.ticker.toLowerCase().includes(search.toLowerCase()) &&
            !widget.pos.name.toLowerCase().includes(search.toLowerCase())) {
            widget.dom.style.display = "none"
        } else {
            widget.dom.style.display = ""
        }

        widget.chart.resize();
    }
}

const searchBar = document.getElementById("searchBarElement") as HTMLInputElement;
searchBar.addEventListener("input", () => {
    filterWidgets(widgetsArray, searchBar.value)
})


const select = document.getElementById("sortBySelect") as HTMLSelectElement;

select.addEventListener("change", () => {
    switch (select.value) {
        case "winners":
            widgetsArray.sort((a, b) => b.pos.upl - a.pos.upl);
            break;

        case "losers":
            widgetsArray.sort((a, b) => a.pos.upl - b.pos.upl);
            break;
    }

    widgetsArray.forEach((widget) => {
        widgets?.appendChild(widget.dom);
    });
});
