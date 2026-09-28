import { getData, postData, getUserDetails } from "./api";

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


const userDetails = await getUserDetails();
const userSettings = await getData("/accountSettingsDetails");
email.value = userDetails.email;


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


const privacyModeCheckboxElement = document.getElementById("privacyModeCheckbox") as HTMLInputElement
const privacyModeToggled = userSettings.privacy_mode;
if (privacyModeToggled == "true") {
    privacyModeCheckboxElement.checked = true;
} else {
    privacyModeCheckboxElement.checked = false;
}

privacyModeCheckboxElement.addEventListener("change", async () => {
    const checkboxResponse = await postData("/togglePrivacyMode", {})
    console.log(checkboxResponse);
})




const deleteForm = document.getElementById("deleteAccountForm")

deleteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const confirmed = confirm(
        "Are you sure you want to delete your account? \nThis action cannot be undone and your account will be permanently deleted."
    )

    if (!confirmed) {
        return;
    }

    const response = await postData("/deleteUser", {})

    if (response.status == 200) {
        window.location.href = "/login"
    }

})

