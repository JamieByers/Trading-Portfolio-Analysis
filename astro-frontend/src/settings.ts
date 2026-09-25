import { getData, postData } from "./api";

const cog = document.getElementById("cog");

cog.addEventListener("click", () => {
    let sidebar = document.getElementById("settingsSidebar");
    let current_z_index = sidebar.style.zIndex;

    if (current_z_index == "-1") {
        sidebar.style.zIndex = "1";
    } else {
        sidebar.style.zIndex = "-1";
    }
})

const accountSettingsForm = document.getElementById("accountSettingsForm") as HTMLFormElement
const email = document.getElementById("email") as HTMLInputElement

async function getUserDetails() {
    const userDetails = await getData("/accountSettingsDetails");

    email.value = userDetails[1]

    return userDetails
}

getUserDetails();

accountSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(accountSettingsForm);

    console.log("formdata", formData)

    postData("/editAccountSettings", {
        email: formData.get("email"),
        password: formData.get("password"),
        confirm_password: formData.get("confirm_password"),
    })
})

const keyRowsForm = document.getElementById("keyRowsForm") as HTMLFormElement
console.log(keyRowsForm)

keyRowsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const keyRowsFormData = new FormData(keyRowsForm)

    postData("/addTradingKeys", {
        publicKey: keyRowsFormData.get("publicKey"),
        privateKey: keyRowsFormData.get("privateKey")
    })
})





