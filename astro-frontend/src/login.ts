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

    try {
        const response = await postData("/login", body)

        console.log(response)
        console.log(await response.text())

        if (response.status == 200) {
            window.location.pathname = "/"
        }
    } catch (error) {
        console.log("ERROR ERROR ERROR")
        console.log(error)

        const errorMessageElement = document.getElementById("errorMessage")

        if (errorMessageElement) {
            errorMessageElement.innerHTML = "Error: Username or password is incorrect"
        }
    }

});

