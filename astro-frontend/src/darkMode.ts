import { getData, postData } from "./api";


export async function initDarkModeSettings() {
    const userSettings = await getData("/accountSettingsDetails");

    const darkModeCheckboxElement = document.getElementById("darkModeCheckbox") as HTMLInputElement
    console.log(darkModeCheckboxElement)
    const darkModeToggled = userSettings.dark_mode;
    if (darkModeToggled == "true") {
        darkModeCheckboxElement.checked = true;
    } else {
        darkModeCheckboxElement.checked = false;
    }

    darkModeCheckboxElement.addEventListener("change", async () => {
        const darkModeCheckboxElement = document.getElementById("darkModeCheckbox") as HTMLInputElement
        const darkModeToggled = darkModeCheckboxElement.checked;

        setDarkMode(darkModeToggled)

        const checkboxResponse = await postData("/toggleDarkMode", {})

        console.log(checkboxResponse)
    })

}

export async function initDarkMode() {
    const settings = await getData("/accountSettingsDetails")
    const darkModeToggled = settings.dark_mode;

    console.log("running init dark mode", darkModeToggled)

    setDarkMode(darkModeToggled)
}

export function setDarkMode(darkModeToggled) {
    const enabled = darkModeToggled === true || darkModeToggled === "true";

    if (enabled) {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }

    window.dispatchEvent(new Event("themechange"))
}


