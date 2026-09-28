import { getData } from "./api"

export async function initAdmin() {
    const databaseUsersButton = document.getElementById("databaseUsersButton")
    const databaseTradingKeysButton = document.getElementById("databaseTradingKeysButton")
    const databaseSessionsButton = document.getElementById("databaseSessionsButton")

    const buttons = [databaseUsersButton, databaseTradingKeysButton, databaseSessionsButton]
    const table = document.getElementById("adminPageTable")

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const pageData = await getData("/database/" + button.dataset.path)
            console.log("Clicked: " + button)
            console.log(pageData)

            let html = ""

            let headerRow = "<tr>"
            for (let key of Object.keys(pageData)) {
                headerRow += `<th>${key}</th>`
            }
            headerRow += "</tr>"
            html += headerRow

            let columns = Object.values(pageData)

            const rows = columns[0].map((_, rowIndex) =>
                columns.map(column => column[rowIndex])
            )
            rows.sort((a, b) => Number(a[0]) - Number(b[0]))

            for (let row of rows) {
                let dataRow = "<tr>"
                for (let value of row) {
                    dataRow += `<td>${value}</td>`
                }
                dataRow += "</tr>"
                html += dataRow
            }

            table.innerHTML = html

        })

    })

}
