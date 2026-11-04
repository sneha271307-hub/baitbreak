const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const messageBox = document.getElementById("message");

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

// Show / hide password
togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Hide" : "Show";
});

// Display messages
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
}

// Login form submission
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    loginButton.disabled = true;
    loginButton.innerHTML = "<span>Signing in...</span>";

    try {
        const response = await fetch(
            "https://baitbreak-1.onrender.com/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await res.json();

if (data.success && data.token) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  window.location.href = "dashboard.html";
} else {
  alert(data.message || "Login failed");
}

        if (!response.ok) {
            throw new Error(
                data.message || data.error || "Login failed."
            );
        }

        if (!data.token) {
            throw new Error(
                "Login succeeded, but no authentication token was received."
            );
        }

        // Save token
        sessionStorage.setItem("baitbreakToken", data.token);

        // Save user information
        if (data.user) {
            sessionStorage.setItem(
                "baitbreakUser",
                JSON.stringify(data.user)
            );
        }

        showMessage("Login successful! Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);
        showMessage(error.message, "error");

    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML =
            "<span>Sign In</span><span>→</span>";
    }
});