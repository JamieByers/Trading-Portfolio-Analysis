import { getData } from "../api"

export async function createPieChart() {
    let all_data = await getData("/all")

    let data = []
    let personal_positons = []
    for ( let pos of all_data ) {
        let p = pos.position;
        personal_positons.push(p)
        if (p.upl > 0) {
            data.push({value: p.upl, name: p.name})
        }
    }

    console.log(data)
    let option = {
        title: {
            text: "Profit Share on Personal Positions"
        },
        series: [
            {
                type: "pie",
                data: data
            }
        ]
    }

    return option
}
