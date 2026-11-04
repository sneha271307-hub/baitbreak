document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("baitbreakToken");
    const userData = sessionStorage.getItem("baitbreakUser");

    const guestNav = document.getElementById("guest-nav");
    const userNav = document.getElementById("user-nav");
    const userName = document.getElementById("nav-user-name");
    const logoutButton = document.getElementById("logout-button");

    if (token && userData) {
        try {
            const user = JSON.parse(userData);

            guestNav.hidden = true;
            userNav.hidden = false;

            userName.textContent = `Welcome, ${user.name || "User"}`;
        } catch (error) {
            sessionStorage.removeItem("baitbreakUser");
            sessionStorage.removeItem("baitbreakToken");
        }
    }

    logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem("baitbreakToken");
        sessionStorage.removeItem("baitbreakUser");

        window.location.reload();
    });
});