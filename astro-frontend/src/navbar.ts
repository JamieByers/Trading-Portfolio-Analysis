import { postData } from "./api";

export function initNavbar() {
    const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
    const mobileNavbar = document.querySelector<HTMLElement>('#mobileNavbar');

    toggle?.addEventListener('click', () => {
        mobileNavbar?.classList.toggle('open');
    });

}

const logoutButton = document.getElementById("logoutButton")

logoutButton?.addEventListener("click", async () => {
    const response = await postData("/logout", {})

    window.location.href = "/login"
})
