import { getData } from "../api"

export async function topChart() {
    let all_data = await getData("/all")

    let personal_positons = []
    for ( let pos of all_data ) {
        let p = pos.position;
        personal_positons.push(p)
    }

    personal_positons.sort((a,b) => b.upl - a.upl)

    let axis_labels = []
    let data = []

    for ( let i = 0; i < 5; i++) {
        axis_labels.push(personal_positons[i].name)
        data.push(personal_positons[i].upl)
    }

    let option = {
        title: {
            text: "Top Winners"
        },
        xAxis: {
            type: "value"
        },
        yAxis: {
            type: "category",
            data: axis_labels.reverse()
        },
        series: [{
            type: "bar",
            data: data.reverse()
        }]
    }

    return option
}
