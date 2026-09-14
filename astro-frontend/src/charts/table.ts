import { getOnlyToday, getTodayElements } from "../api"

type StockRow = {
    name: string,
    ticker: string,
    totalpl: number,
    totalplPercentage: number,
    todaypl: number,
    priceChangePercentage: number,
    volatility: number
    holdingTimeDays: number,
}

type State = {
    stockRowElements: any[]
    stockRows: any[]
    currentSortingKey: keyof StockRow
    descending: boolean
    total_row: StockRow,
}

let state: State = {
    stockRowElements: [],
    stockRows: [],
    currentSortingKey: "totalpl" as keyof StockRow,
    descending: false,
    total_row: null,
}

export async function generateStockTable() {
    let today_elements = await getOnlyToday();

    let stockRows = []
    let rowElements = []

    state.total_row = {
        name: "Total Portfolio",
        ticker: "",
        totalpl: 0,
        totalplPercentage: 0,
        todaypl: 0,
        priceChangePercentage: 0,
        volatility: 0,
        holdingTimeDays: 0,
    }

    for (let element of today_elements) {
        const stockRow = createStockRow(element)
        stockRows.push(stockRow)
    }

    state.total_row.priceChangePercentage = state.total_row.todaypl / state.total_row.totalpl
    state.total_row.totalplPercentage = 100

    state.total_row.priceChangePercentage = Math.round(state.total_row.priceChangePercentage * 100) / 100
    state.total_row.totalpl = Math.round(state.total_row.totalpl * 100) / 100
    state.total_row.todaypl = Math.round(state.total_row.todaypl * 100) / 100
    state.total_row.volatility = Math.round(state.total_row.volatility * 100) / 100

    stockRows = sortStockRows(stockRows)

    for (let stockRow of stockRows) {
        let row = createRow(stockRow)

        row.classList.add(stockRow.todaypl < 0 ? "row-negative" : "row-positive")

        rowElements.push(row)
    }

    let total_row_element = createRow(state.total_row)
    total_row_element.classList.add(state.total_row.todaypl < 0 ? "row-negative" : "row-positive")
    total_row_element.classList.add("final-row")

    rowElements.push(total_row_element)

    state.stockRows = stockRows
    state.stockRowElements = rowElements


    renderTable(stockRows)
    setupSortingListeners()

    return rowElements
}


function setupSortingListeners() {
    const ths = document.querySelectorAll<HTMLElement>("th[data-sort]")

    for (let th of ths) {
        th.addEventListener("click", () => {
            const key = th.dataset.sort as keyof StockRow;

            if (state.currentSortingKey === key) {
                state.descending = !state.descending
            }

            state.currentSortingKey = key

            const stockRows = sortStockRows(state.stockRows, key, state.descending)
            renderTable(stockRows)

        })
    }
}

function sortStockRows(stockRows, sortKey: keyof StockRow = "totalpl", descending=false) {
    return stockRows.sort((a,b) => {
        if (typeof a[sortKey] == "string" && typeof b[sortKey] == "string") {
            return descending ?
                a[sortKey].localeCompare(b[sortKey]) :
                b[sortKey].localeCompare(a[sortKey])
        }

        return descending ?
            a[sortKey] - b[sortKey] :
            b[sortKey] - a[sortKey]

    })
}

function createRow(stock: StockRow) {
    let row = document.createElement("tr")
    row.className = "stockRow"

    let pcp = Math.round(stock.priceChangePercentage * 100) / 100

    row.innerHTML = `
            <td class="w-2/5">
                ${stock.name} |
                ${stock.ticker}
            </td>

            <td>${stock.totalpl} (${stock.totalplPercentage}%)</td>
            <td>${stock.todaypl} (${pcp}%) ${stock.todaypl > 0 ? "▲" : "▼"}</td>
            <td>${stock.volatility}</td>
            <td>${stock.holdingTimeDays}</td>
    `

    let ticker = stock.ticker;
    if (stock.ticker.includes(".")) {
        ticker = stock.ticker.split(".")[0]
    }

    row.addEventListener("click", () => {
        window.location.href = `/page/${ticker}`
    })

    return row
}

function createStockRow(element) {
    let cp = element.position
    let totalpl = cp.position.upl;
    let todaypl = Math.round(element.todaypl * 100) / 100
    let volatility = Math.round(cp.yahooPosition.volatility * 100) / 100
    let totalplPercentage = (totalpl / cp.position.totalCost) * 100;
    totalplPercentage = Math.round(totalplPercentage * 100) / 100

    let stockRow: StockRow = {
        name: cp.yahooPosition.name,
        ticker: cp.yahooPosition.ticker,
        totalpl,
        totalplPercentage,
        todaypl,
        priceChangePercentage: (todaypl / totalpl) * 100,
        volatility: volatility,
        holdingTimeDays: cp.position.holdingTimeDaysValue,
    }

    state.total_row.totalpl += totalpl
    state.total_row.todaypl += element.todaypl
    state.total_row.volatility += volatility
    state.total_row.holdingTimeDays = Math.max(cp.position.holdingTimeDaysValue, state.total_row.holdingTimeDays)

    return stockRow

}


function renderTable(stockRows: StockRow[]) {
    const table = document.getElementById("stockTable")

    table.querySelectorAll(".stockRow").forEach(row => row.remove())

    const newRowElements = []

    for (let stockRow of stockRows) {
        let row = createRow(stockRow)
        row.classList.add(stockRow.todaypl < 0 ? "row-negative" : "row-positive")
        table.appendChild(row)
        newRowElements.push(row)
    }

    let totalRowElement = createRow(state.total_row)
    totalRowElement.classList.add(state.total_row.todaypl < 0 ? "row-negative" : "row-positive")
    totalRowElement.classList.add("final-row")
    table.appendChild(totalRowElement)
    newRowElements.push(totalRowElement)

    state.stockRowElements = newRowElements
}
