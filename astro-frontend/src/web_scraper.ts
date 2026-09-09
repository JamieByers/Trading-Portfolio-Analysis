export async function fetchDescription(ticker: string = "SNDK", title: string ="Sandisk") {
    title = title.replaceAll(" ", "_")

    let result = await fetchDesc(title)
    if (result != "") {
        return result
    } else {
        result = await fetchDesc(ticker)
        return result
    }

}

async function fetchDesc(title: string) {
    const url =
        "https://en.wikipedia.org/w/api.php" +
        "?action=query" +
        "&prop=extracts" +
        "&exintro=true" +
        "&explaintext=true" +
        `&titles=${title}` +
        "&format=json" +
        "&origin=*";

    const response = await fetch(url);
    const data = await response.json();

    const pages = data.query.pages

    const page = Object.values(pages)[0] as { extract?: string };

    const extract = page.extract ?? "";

    console.log(extract)
    return extract;

}

