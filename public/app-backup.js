const form = document.getElementById("analyze-form");
const messageInput = document.getElementById("message-input");
const analyzeButton = document.getElementById("analyze-button");
const buttonLabel = document.getElementById("button-label");
const buttonSpinner = document.getElementById("button-spinner");
const clearButton = document.getElementById("clear-button");
const charCount = document.getElementById("char-count");
const errorMessage = document.getElementById("error-message");
const results = document.getElementById("results");
const scanAnimation = document.getElementById("scan-animation");

const API_URL = "/api/analyze";


/* CHARACTER COUNTER */

messageInput.addEventListener("input", () => {
  charCount.textContent = `${messageInput.value.length} / 10000`;
});


/* EXAMPLE MESSAGE BUTTONS */

document.querySelectorAll(".example-chip").forEach((button) => {

  button.addEventListener("click", () => {

    messageInput.value = button.dataset.example;

    charCount.textContent =
      `${messageInput.value.length} / 10000`;

    messageInput.focus();

    results.hidden = true;
    errorMessage.hidden = true;

    messageInput.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  });

});


/* CLEAR MESSAGE */

clearButton.addEventListener("click", () => {

  messageInput.value = "";

  charCount.textContent = "0 / 10000";

  results.hidden = true;
  errorMessage.hidden = true;

  messageInput.focus();

});


/* FORM SUBMISSION */

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message) {
    showError("Please paste a message before analyzing it.");
    return;
  }

  setLoading(true);

  errorMessage.hidden = true;
  results.hidden = true;
  scanAnimation.hidden = false;

  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ message })

    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {

      throw new Error(
        data.error || `Server error (${response.status})`
      );

    }

    renderResults(data);

    results.hidden = false;

    results.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

  catch (error) {

    console.error("BaitBreak analysis failed:", error);

    showError(
      "Unable to analyze this message. Check that the BaitBreak server is running. " +
      (error.message || "")
    );

  }

  finally {

    setLoading(false);
    scanAnimation.hidden = true;

  }

});


/* LOADING STATE */

function setLoading(isLoading) {

  analyzeButton.disabled = isLoading;

  buttonLabel.hidden = isLoading;

  buttonSpinner.hidden = !isLoading;

}


/* ERROR MESSAGE */

function showError(message) {

  errorMessage.textContent = message;

  errorMessage.hidden = false;

}


/* RENDER RESULTS */

function renderResults(data) {

  const risk = data.risk || {};

  const explanation = data.explanation || {};

  const extraction = data.extraction || {};


  const score = Number(risk.score);

  document.getElementById("risk-score").textContent =

    Number.isFinite(score)
      ? Math.max(0, Math.min(100, score))
      : "—";


  const level = String(
    risk.level || explanation.level || "UNKNOWN"
  ).toUpperCase();


  const badge = document.getElementById("risk-badge");

  badge.textContent = level;

  badge.className = "risk-badge";


  if (["HIGH", "CRITICAL", "DANGEROUS"].includes(level)) {

    badge.classList.add("high");

  }

  else if (
    ["MEDIUM", "SUSPICIOUS", "MODERATE"].includes(level)
  ) {

    badge.classList.add("medium");

  }

  else if (["LOW", "SAFE"].includes(level)) {

    badge.classList.add("low");

  }


  document.getElementById("risk-title").textContent = getRiskTitle(level);
document.getElementById("risk-summary").textContent = getRiskSummary(level);

// Update visual threat meter
const progress = document.getElementById("threat-progress");

progress.style.width = `${Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0))}%`;
progress.className = "threat-progress";

if (["HIGH", "CRITICAL", "DANGEROUS"].includes(level)) {
  progress.classList.add("threat-high");
} else if (["MEDIUM", "SUSPICIOUS", "MODERATE"].includes(level)) {
  progress.classList.add("threat-medium");
} else {
  progress.classList.add("threat-low");
}


  renderSignals(extraction.ruleHits || []);

  renderExplanation(explanation);

  renderActions(
    explanation.safeActions || explanation.actions || []
  );

}


/* RISK TITLES */

function getRiskTitle(level) {

  if (["HIGH", "CRITICAL", "DANGEROUS"].includes(level)) {

    return "Potentially dangerous message";

  }

  if (["MEDIUM", "SUSPICIOUS", "MODERATE"].includes(level)) {

    return "Warning signs detected";

  }

  if (["LOW", "SAFE"].includes(level)) {

    return "Fewer warning signs detected";

  }

  return "Analysis complete";

}


/* RISK SUMMARIES */

function getRiskSummary(level) {

  if (["HIGH", "CRITICAL", "DANGEROUS"].includes(level)) {

    return "Avoid clicking links, installing files, sending money or sharing sensitive information without independent verification.";

  }

  if (["MEDIUM", "SUSPICIOUS", "MODERATE"].includes(level)) {

    return "Pause and verify the sender and claims through a trusted, independent source.";

  }

  if (["LOW", "SAFE"].includes(level)) {

    return "The checks found fewer warning signs. This does not guarantee that the message is safe.";

  }

  return "Review the detected signals and verify important claims independently.";

}


/* DETECTED SIGNALS */

function renderSignals(ruleHits) {

  const container = document.getElementById("signals-list");

  container.replaceChildren();


  if (!Array.isArray(ruleHits) || ruleHits.length === 0) {

    const empty = document.createElement("p");

    empty.className = "empty-signals";

    empty.textContent =
      "No configured warning signals were detected. Scams can still use wording that these checks do not recognize.";

    container.appendChild(empty);

    return;

  }


  ruleHits.forEach((hit) => {

    const item = document.createElement("article");

    item.className = "signal-item";


    const title = document.createElement("p");

    title.className = "signal-title";

    title.textContent = hit.name || hit.id || "Warning signal";


    const reason = document.createElement("p");

    reason.className = "signal-reason";

    reason.textContent =
      hit.reason || "This message matches a configured warning pattern.";


    const tag = document.createElement("span");

    tag.className = "signal-tag";

    tag.textContent =
      `${hit.stage || "SIGNAL"}${hit.observed ? ` · "${hit.observed}"` : ""}`;


    item.append(title, reason, tag);

    container.appendChild(item);

  });

}


/* EXPLANATION */

function renderExplanation(explanation) {

  const element = document.getElementById("explanation-text");

  const candidates = [

    explanation.explanation,

    explanation.summary,

    explanation.message,

    explanation.text

  ];


  const text = candidates.find(

    (candidate) =>

      typeof candidate === "string" && candidate.trim()

  );


  element.textContent =

    text ||

    "BaitBreak checks configured scam indicators. Verify the sender and any claimed government benefit through an official channel.";

}


/* SAFETY ACTIONS */

function renderActions(actions) {

  const list = document.getElementById("actions-list");

  list.replaceChildren();


  if (typeof actions === "string") {

    actions = [actions];

  }


  if (!Array.isArray(actions) || actions.length === 0) {

    actions = [

      "Do not share OTPs, PINs, passwords or banking details.",

      "Avoid installing APK files sent through messages.",

      "Visit the official website directly instead of following an unsolicited link."

    ];

  }


  actions.forEach((action) => {

    const item = document.createElement("li");


    if (typeof action === "string") {

      item.textContent = action;

    }

    else if (action && typeof action.text === "string") {

      item.textContent = action.text;

    }

    else if (action && typeof action.message === "string") {

      item.textContent = action.message;

    }

    else {

      item.textContent = JSON.stringify(action);

    }


    list.appendChild(item);

  });

}