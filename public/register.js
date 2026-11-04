const registerForm = document.getElementById("registerForm");
const registerButton = document.getElementById("registerButton");
const messageBox = document.getElementById("message");

// Password visibility
document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);

        if (input.type === "password") {
            input.type = "text";
            button.textContent = "Hide";
        } else {
            input.type = "password";
            button.textContent = "Show";
        }
    });
});

// Display messages
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
}

// Registration
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
    }

    if (password.length < 8) {
        showMessage("Password must contain at least 8 characters.", "error");
        return;
    }

    registerButton.disabled = true;
    registerButton.innerHTML = "<span>Creating account...</span>";

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || data.error || "Registration failed."
            );
        }

        showMessage(
            "Account created successfully! Redirecting to login...",
            "success"
        );

        registerForm.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        registerButton.disabled = false;
        registerButton.innerHTML =
            "<span>Create Account</span><span>→</span>";
    }
});