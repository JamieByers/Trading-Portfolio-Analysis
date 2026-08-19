import { getData } from "../api"

export async function topWinnersToday() {
    let all_data = await getData("/all")

    let todays_elements = []

    let keep_date = ""
    for (let pos of all_data) {
        let yp = pos.yahooPosition
        let tels = yp.timestamp_elements

        let todays_element = tels[tels.length - 1]
        let date = todays_element.timestamp.slice(0,10)
        keep_date = date
        let today_pl = pos.position.currentValue - ( pos.position.currentValue / (1+(todays_element.priceChangePercentage / 100)))
        todays_elements.push({ticker: yp.ticker, element: todays_element, pl: today_pl})
    }

    let split_date = keep_date.split("-")
    keep_date = split_date[2] + "/" + split_date[1] + "/" + split_date[0]


    todays_elements.sort((a,b) => b.element.priceChange - a.element.priceChange)
    todays_elements = todays_elements.slice(0,5)

    let names = []
    let pls = []
    let changesp = []

    for (let el of todays_elements) {
        names.push(el.ticker)
        pls.push(el.pl)
        changesp.push(el.element.priceChangePercentage)
    }

    let option = {
        title: {
            text: "Top Winners Today (" + keep_date + ")"
        },
        legend: {
            data: ["Absolute", "Percentage"],
            bottom: 10,
            left: 'center',
            orient: 'horizontal',
            itemWidth: 16,
            itemHeight: 16,
            itemGap: 30,
            icon: 'rect',
            textStyle: { fontSize: 13, color: '#333' }
        },
        xAxis: {
            type: "value"
        },
        yAxis: {
            type: "category",
            data: names.reverse()
        },
        series: [
            {
                name: "Absolute",
                type: "bar",
                data: pls.reverse(),
                label: {
                    show: true,
                    position: "right",
                    formatter: (params: any) => `£${Number(params.value).toFixed(2)}`
                },
                itemStyle: {
                    color: "#386641"
                }
             },
            {
                name: "Percentage",
                type: "bar",
                data: changesp.reverse(),
                label: {
                    show: true,
                    position: "right",
                    formatter: (params: any) => `${Number(params.value).toFixed(2)}%`
                },
                itemStyle: {
                    color: "#6a994e"
                }
             }
        ],
        tooltip: {
            position: [10,10],
        }
    }

    return option

}


export async function topLosersToday() {
    let all_data = await getData("/all")

    let todays_elements = []
    let keep_date = ""

    for (let pos of all_data) {
        let yp = pos.yahooPosition
        let tels = yp.timestamp_elements

        let todays_element = tels[tels.length - 1]
        let date = todays_element.timestamp.slice(0,10)
        keep_date = date
        let today_pl = pos.position.currentValue - ( pos.position.currentValue / (1+(todays_element.priceChangePercentage / 100)))
        todays_elements.push({ticker: yp.ticker, element: todays_element, pl: today_pl})
    }

    let split_date = keep_date.split("-")
    keep_date = split_date[2] + "/" + split_date[1] + "/" + split_date[0]

    todays_elements.sort((a,b) => a.element.priceChange - b.element.priceChange)
    todays_elements = todays_elements.slice(0,5)

    let names = []
    let pls = []
    let changesp = []

    for (let el of todays_elements) {
        names.push(el.ticker)
        pls.push(el.pl)
        changesp.push(el.element.priceChangePercentage)
    }

    let option = {
        title: {
            text: "Top Losers Today (" + keep_date + ")"
        },

        legend: {
            data: ["Absolute", "Percentage"],
            bottom: 10,
            left: 'center',
            orient: 'horizontal',
            itemWidth: 16,
            itemHeight: 16,
            itemGap: 30,
            icon: 'rect',
            textStyle: { fontSize: 13, color: '#333' }
        },
        xAxis: [
            {
                type: "value",
                axisLabel: {
                    formatter: (value: number) => `-£${value}`
                }
            },
            {
                type: "value",
                axisLabel: {
                    formatter: (value: number) => `-${value}%`
                }
            },
        ],
        yAxis: {
            type: "category",
            position: "left",
            data: names.reverse()
        },
        series: [
            {
                name: "Absolute",
                type: "bar",
                data: pls.map(pl => pl *= -1).reverse(),

                label: {
                    show: true,
                    position: "right",
                    formatter: (params: any) => `£${Number(params.value).toFixed(2)}`
                },

                itemStyle: {
                    color: "#780000"
                }
             },
            {
                name: "Percentage",
                type: "bar",
                data: changesp.map(changep => changep *= -1).reverse(),
                label: {
                    show: true,
                    position: "right",
                    formatter: (params: any) => `${Number(params.value).toFixed(2)}%`
                },

                itemStyle: {
                    color: "#c1121f"
                }
             }
        ],
        tooltip: {
            position: [10,10]
        }
    }

    return option

}


export async function topMoversToday() {
    let all_data = await getData("/all")

    let todays_elements = []
    let keep_date = ""

    for (let pos of all_data) {
        let yp = pos.yahooPosition
        let tels = yp.timestamp_elements

        let todays_element = tels[tels.length - 1]
        let date = todays_element.timestamp.slice(0,10)
        keep_date = date
        todays_elements.push({ticker: yp.ticker, element: todays_element })
    }

    let split_date = keep_date.split("-")
    keep_date = split_date[2] + "/" + split_date[1] + "/" + split_date[0]

    todays_elements.sort((a,b) => a.element.priceChange - b.element.priceChange)
    todays_elements = todays_elements.slice(0,5)

    let names = []
    let changes = []
    let changesp = []

    for (let el of todays_elements) {
        names.push(el.ticker)
        changes.push(el.element.priceChange)
        changesp.push(el.element.priceChangePercentage)
    }

    let option = {
        title: {
            text: "Top Movers Today (" + keep_date + ")"
        },

        legend: {
            data: ["Absolute", "Percentage"],
            bottom: 10,
            left: 'center',
            orient: 'horizontal',
            itemWidth: 16,
            itemHeight: 16,
            itemGap: 30,
            icon: 'rect',
            textStyle: { fontSize: 13, color: '#333' }
        },
        xAxis: [
            {
                type: "value",
                axisLabel: {
                    formatter: (value: number) => `-£${value}`
                }
            },
            {
                type: "value",
                axisLabel: {
                    formatter: (value: number) => `-${value}%`
                }
            },
        ],
        yAxis: {
            type: "category",
            position: "left",
            data: names.reverse()
        },
        series: [
            {
                name: "Absolute",
                type: "bar",
                data: changes.map(c => c *= -1).reverse(),

                label: {
                    show: true,
                    position: "right",
                    formatter: (params: any) => `£${Number(params.value).toFixed(2)}`
                },

                itemStyle: {
                    color: "#231942"
                }
             },
            {
                name: "Percentage",
                type: "bar",
                data: changesp.map(changep => changep *= -1).reverse(),
                label: {
                    show: true,
                    position: "right",
                    formatter: (params: any) => `${Number(params.value).toFixed(2)}%`
                },

                itemStyle: {
                    color: "#5e548e"
                }
             }
        ],
        tooltip: {
            position: [10,10]
        }
    }

    return option

}


