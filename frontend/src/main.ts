import * as echarts from "echarts";



async function getData(path: string) {
    let url = "http://localhost:8080"
    const response = await fetch(url+path);
    if (!response.ok) {
        throw new Error
    }

    let text = await response.text();
    console.log(response);
    console.log(text);
}


console.log("before button")

document.getElementById("butt")?.addEventListener("click", () => {
    console.log("Running getData");
    getData("/SNDK")
})

console.log("after button")


let mychart = echarts.init(document.getElementById("chart"));

let option = {
  xAxis: {
    type: 'category',
    data: ['A', 'B', 'C']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150],
      type: 'line'
    }
  ]
};

mychart.setOption(option);

