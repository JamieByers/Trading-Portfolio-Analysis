import { postData } from "./api.ts"

const registerForm = document.getElementById("registerForm") as HTMLFormElement

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);

    const email = formData.get("email").toString()
    const password = formData.get("password").toString()
    const confirmPassword = formData.get("confirmPassword").toString()

    let error: string;

    error = validateEmail(email)
    error = validatePassword(password, confirmPassword)

    if (error == "") {
        let body = {
            email: email,
            password: password
        }

        const response = await postData("/register", body)
        console.log(response)
        console.log(await response.text())

        if (response.status == 200) {
            window.location.href = "/"
        }
    } else {
        const errorMsgElement = document.getElementById("errorMessage")
        errorMsgElement.innerHTML = error
    }

});

function validateEmail(email: string): string {
    if (!email.includes("@") || !email.includes(".")) {
        return "Error: Invalid email, please input a valid email"
    }
    return ""
}

function validatePassword(password: string, confirmPassword: string): string {
    if (password.length < 8) {
        return "Error: Password must be at least 8 characters"
    }

    let containsUpper = false
    let containsNumeric = false
    Array.from(password).forEach(ch => {
        if (/[A-Z]/.test(ch)) {
            containsUpper = true
        }

        if (/[0-9]/.test(ch)) {
            containsNumeric = true
        }
    })

    if (!containsUpper) {
        return "Error: Password must contain at least one upper case character"
    }

    if (!containsNumeric) {
        return "Error: Password must contain at least one number"
    }

    if (password !== confirmPassword) {
        return "Error: Passwords do not match"
    }

    return ""
}
