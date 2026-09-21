import { postData } from "./api.ts"

console.log("Running login.ts")

const loginForm = document.getElementById("loginForm") as HTMLFormElement

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);

    let body = {
        email: formData.get("email"),
        password: formData.get("password")
    }

    const response = await postData("/login", body)
    console.log(response)
    console.log(await response.text())

    if (response.status == 200) {
        window.location.pathname = "/"
    }

});

