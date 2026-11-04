document.addEventListener("DOMContentLoaded", async () => {

    // 1. AUTHENTICATION CHECK
    const token = sessionStorage.getItem("baitbreakToken");
    const userData = sessionStorage.getItem("baitbreakUser");

    if (!token || !userData) {
        window.location.href = "login.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        sessionStorage.removeItem("baitbreakToken");
        sessionStorage.removeItem("baitbreakUser");
        window.location.href = "login.html";
        return;
    }

    // 2. WELCOME MESSAGE
    document.getElementById("welcome-name").textContent =
        `Welcome, ${user.name || "User"}!`;

    // 3. LOGOUT
    document.getElementById("logout-button").addEventListener("click", () => {

        sessionStorage.removeItem("baitbreakToken");
        sessionStorage.removeItem("baitbreakUser");

        window.location.href = "login.html";
    });

    // 4. ELEMENT REFERENCES
    const historyContainer = document.getElementById("history-container");

    const searchInput = document.getElementById("search-history");
    const riskFilter = document.getElementById("risk-filter");
    const sortHistory = document.getElementById("sort-history");

    // 5. FETCH SCAN HISTORY
    try {

        const response = await fetch("/api/history", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load history");
        }

        const history = Array.isArray(data.history)
            ? data.history
            : [];

        // 6. CALCULATE STATISTICS

        const highRisk = history.filter(scan =>
            ["HIGH", "CRITICAL", "DANGEROUS"].includes(
                String(scan.riskLevel || "").toUpperCase()
            )
        ).length;

        const mediumRisk = history.filter(scan =>
            ["MEDIUM", "SUSPICIOUS", "MODERATE"].includes(
                String(scan.riskLevel || "").toUpperCase()
            )
        ).length;

        const lowRisk = history.filter(scan =>
            ["LOW", "SAFE"].includes(
                String(scan.riskLevel || "").toUpperCase()
            )
        ).length;

        document.getElementById("total-scans").textContent =
            data.total ?? history.length;

        document.getElementById("high-risk").textContent = highRisk;

        document.getElementById("medium-risk").textContent = mediumRisk;

        document.getElementById("low-risk").textContent = lowRisk;


        // 7. SEARCH, FILTER AND SORT

        function renderHistory() {

            const searchTerm = searchInput.value
                .toLowerCase()
                .trim();

            const selectedRisk = riskFilter.value;
            const sortOrder = sortHistory.value;

            let filteredHistory = [...history];

            // SEARCH BY MESSAGE
            filteredHistory = filteredHistory.filter(scan =>
                String(scan.message || "")
                    .toLowerCase()
                    .includes(searchTerm)
            );

            // FILTER BY RISK LEVEL
            filteredHistory = filteredHistory.filter(scan => {

                const level = String(scan.riskLevel || "")
                    .toUpperCase();

                if (selectedRisk === "ALL") return true;

                if (selectedRisk === "HIGH") {
                    return ["HIGH", "CRITICAL", "DANGEROUS"]
                        .includes(level);
                }

                if (selectedRisk === "MEDIUM") {
                    return ["MEDIUM", "SUSPICIOUS", "MODERATE"]
                        .includes(level);
                }

                if (selectedRisk === "LOW") {
                    return ["LOW", "SAFE"].includes(level);
                }

                return true;
            });

            // SORT BY DATE
            filteredHistory.sort((a, b) => {

                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();

                return sortOrder === "newest"
                    ? dateB - dateA
                    : dateA - dateB;
            });

            // DISPLAY HISTORY
            historyContainer.replaceChildren();

            if (filteredHistory.length === 0) {

                const emptyMessage = document.createElement("p");

                emptyMessage.textContent = history.length === 0
                    ? "No scans found yet."
                    : "No matching scans found.";

                historyContainer.appendChild(emptyMessage);

                return;
            }

            filteredHistory.forEach(scan => {

                const card = document.createElement("div");
                card.className = "history-card";

                const message = document.createElement("p");
                message.textContent = scan.message || "No message available";

                const risk = document.createElement("span");
                risk.textContent =
                    `${scan.riskLevel || "UNKNOWN"} — Score: ${scan.riskScore ?? "N/A"}`;

                const date = document.createElement("small");

                const parsedDate = new Date(scan.createdAt);

                date.textContent = Number.isNaN(parsedDate.getTime())
                    ? "Date unavailable"
                    : parsedDate.toLocaleString();

                card.append(message, risk, date);

                historyContainer.appendChild(card);
            });
        }


        // 8. EVENT LISTENERS

        searchInput.addEventListener("input", renderHistory);

        riskFilter.addEventListener("change", renderHistory);

        sortHistory.addEventListener("change", renderHistory);


        // 9. INITIAL DISPLAY

        renderHistory();

    } catch (error) {

        console.error("Dashboard error:", error);

        historyContainer.textContent =
            "Unable to load scan history. Please try again.";

    }

});