import { postData, getData } from "./api";

export async function initNavbar() {
    const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
    const mobileNavbar = document.querySelector<HTMLElement>('#mobileNavbar');

    toggle?.addEventListener('click', () => {
        mobileNavbar?.classList.toggle('open');
    });

    const adminNavbarItem = document.getElementById("desktopAdminItem");
    const userDetails = await getData("/userDetails");
    if (userDetails.user_type == "ADMIN") {
        adminNavbarItem.style.display = "flex";
    } else {
        adminNavbarItem.style.display = "none";

    }
}

const logoutButton = document.getElementById("logoutButton")

logoutButton?.addEventListener("click", async () => {
    await postData("/logout", {})

    window.location.href = "/login"
})

const mobileLogoutButton = document.getElementById("mobileLogoutButton")

mobileLogoutButton?.addEventListener("click", async () => {
    await postData("/logout", {})

    window.location.href = "/login"
})

