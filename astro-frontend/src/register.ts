import { postData } from "./api.ts"

const registerForm = document.getElementById("registerForm") as HTMLFormElement

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);

    if (formData.get("password") === formData.get("confirmPassword")) {
        let body = {
            email: formData.get("email"),
            password: formData.get("password")
        }

        const response = await postData("/register", body)
        console.log(response)
        console.log(await response.text())

    }

});


