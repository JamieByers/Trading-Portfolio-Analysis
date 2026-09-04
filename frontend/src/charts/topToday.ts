import { getTodayElements } from "../api"


export async function topWinnersToday() {
    let todays_elements = await getTodayElements();

    todays_elements.sort((a,b) => b.todaypl- a.todaypl)
    todays_elements = todays_elements.slice(0,5)

    let names = todays_elements.map(el => el.position.yahooPosition.ticker)
    let pls = todays_elements.map(el => el.todaypl)
    let changesp = todays_elements.map(el => el.tpcp)

    let option = {
        title: {
            text: "Top Winners Today (Last 24hrs)"
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
    let todays_elements = await getTodayElements();

    todays_elements.sort((a,b) => a.todaypl- b.todaypl)
    todays_elements = todays_elements.slice(0,5)

    let names = todays_elements.map(el => el.position.yahooPosition.ticker)
    let pls = todays_elements.map(el => el.todaypl)
    let changesp = todays_elements.map(el => el.tpcp)

    let option = {
        title: {
            text: "Top Losers Today (Last 24hrs)"
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
    let todays_elements = await getTodayElements();

    todays_elements.sort((a,b) => b.change - a.change)
    todays_elements = todays_elements.slice(0,5)

    let names = todays_elements.map(el => el.position.yahooPosition.ticker)
    let changes = todays_elements.map(el => el.change)
    let changesp = todays_elements.map(el => el.tpcp)

    let option = {
        title: {
            text: "Top Movers Today (Last 24hrs)"
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


