import { getData } from "../api.ts"

export async function getPageStockInfo(ticker: string) {
    const tickerData = getData(ticker + "?holdingTime=true")
}
