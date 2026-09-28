import { getData } from "./api"

const PRIVACY_KEY = "privacy_mode"

export async function initPrivacy() {
    console.log("RUNNING INIT PRIVACY")

    const settings = await getData("/accountSettingsDetails")

    console.log(settings)

    const privacyModeToggled = settings.privacy_mode

    console.log("toggled? : " + privacyModeToggled)

    localStorage.setItem(PRIVACY_KEY, String(privacyModeToggled))
}

export function getPrivacyMode(): boolean {
    return localStorage.getItem(PRIVACY_KEY) === "true";
}

export function handlePrivacyMode() {
    let isToggled = getPrivacyMode()

    if (isToggled) {
        const privateData = document.querySelectorAll("[data-private]")
        for (let el of privateData) {
            el.classList.add("private-data")
        }
    }

}
