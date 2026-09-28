import { getData } from "./api"

const PRIVACY_KEY = "privacy_mode"

export async function initPrivacy() {
    const settings = await getData("accountSettingsDetails")

    const privacyModeToggled = settings.privacy_mode

    localStorage.setItem(PRIVACY_KEY, privacyModeToggled)
}

export function getPrivacyMode(): boolean {
    return localStorage.getItem(PRIVACY_KEY) === "true";
}
