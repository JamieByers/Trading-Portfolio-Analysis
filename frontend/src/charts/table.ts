import { getData, getTodayElements } from "../api"

type StockRow = {
    name: string,
    ticker: string,
    totalpl: number,
    todaypl: number,
    priceChangePercentage: number,
    volatility: number
    holdingTime: number, // days
}


export async function generateStockTable() {
    // let all_data = await getData("/profit-over-time")
    let today_elements = await getTodayElements();

    let stockRows = []

    let total_row: StockRow = {
        name: "Total Portfolio",
        ticker: "",
        totalpl: 0,
        todaypl: 0,
        priceChangePercentage: 0,
        volatility: 0,
        holdingTime: 0,
    }

    for (let element of today_elements) {
        let cp = element.position
        let totalpl = cp.position.upl;
        let todaypl = Math.round(element.todaypl * 100) / 100
        let volatility = Math.round(cp.yahooPosition.volatility * 100) / 100

        console.log(element)

        let stockRow: StockRow = {
            name: cp.yahooPosition.name,
            ticker: cp.yahooPosition.ticker,
            totalpl,
            todaypl,
            priceChangePercentage: (todaypl / totalpl) * 100,
            volatility: volatility,
            holdingTime: cp.position.holdingTimeDaysValue,
        }

        total_row.totalpl += totalpl
        total_row.todaypl += element.todaypl
        total_row.volatility += volatility
        total_row.holdingTime = Math.max(cp.position.holdingTimeDaysValue, total_row.holdingTime)

        stockRows.push(stockRow)
    }

    total_row.priceChangePercentage = total_row.todaypl / total_row.totalpl

    total_row.priceChangePercentage = Math.round(total_row.priceChangePercentage * 100) / 100
    total_row.totalpl = Math.round(total_row.totalpl * 100) / 100
    total_row.todaypl = Math.round(total_row.todaypl * 100) / 100
    total_row.volatility = Math.round(total_row.volatility * 100) / 100

    let table = document.getElementById("stockTable")

    stockRows.sort((a,b) => b.totalpl - a.totalpl)

    let green = "#C1F2C3"
    let red = "#FFB5B5"

    for (let stockRow of stockRows) {
        let row = createRow(stockRow)

        row.style.backgroundColor = stockRow.todaypl < 0 ? red : green

        table.appendChild(row)
    }

    let total_row_element = createRow(total_row)
    total_row_element.style.backgroundColor = total_row.todaypl < 0 ? red : green

    table.appendChild(total_row_element)
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

        <td>${stock.totalpl}</td>
        <td>${stock.todaypl} (${pcp}%) ${stock.todaypl > 0 ? "▲" : "▼"}</td>
        <td>${stock.volatility}</td>
        <td>${stock.holdingTime}</td>
    `

    return row
}
