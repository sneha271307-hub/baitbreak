/* BAITBREAK - app.js (scanner, results, guardian) */

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

const API_URL = "https://baitbreak-1.onrender.com/api/analyze";
const MAX_LENGTH = 10000;
let lastAnalysisData = null;

/* ---------- LANGUAGE HELPERS ---------- */

function isHindi() {
  return window.BaitBreakI18n?.getLanguage() === "hi";
}

function tr(en, hi) {
  return isHindi() ? hi : en;
}

/* ---------- CHARACTER COUNTER ---------- */

function updateCharCount() {
  charCount.textContent = `${messageInput.value.length} / ${MAX_LENGTH}`;
}

messageInput.addEventListener("input", updateCharCount);

/* ---------- EXAMPLE MESSAGE BUTTONS ---------- */

document.querySelectorAll(".example-chip").forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.example || "";
    updateCharCount();

    lastAnalysisData = null;
    results.hidden = true;
    errorMessage.hidden = true;

    messageInput.focus();
    messageInput.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

/* ---------- CLEAR MESSAGE ---------- */

clearButton.addEventListener("click", () => {
  messageInput.value = "";
  updateCharCount();

  lastAnalysisData = null;
  results.hidden = true;
  errorMessage.hidden = true;

  messageInput.focus();
});

/* ---------- FORM SUBMISSION ---------- */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message) {
    showError(
      tr(
        "Please paste a message before analyzing it.",
        "जाँच करने से पहले कृपया कोई संदेश पेस्ट करें।"
      )
    );
    return;
  }

  if (message.length > MAX_LENGTH) {
    showError(
      tr(
        `Message is too long. Please keep it under ${MAX_LENGTH} characters.`,
        `संदेश बहुत लंबा है। कृपया इसे ${MAX_LENGTH} अक्षरों से कम रखें।`
      )
    );
    return;
  }

  setLoading(true);
  errorMessage.hidden = true;
  results.hidden = true;
  scanAnimation.hidden = false;

  try {
    const token = sessionStorage.getItem("baitbreakToken");

    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("https://baitbreak-1.onrender.com/api/analyze", {
      method: "POST",
      headers,
      body: JSON.stringify({ message })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Server error (${response.status})`);
    }

    lastAnalysisData = data;
    renderResults(data);

    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("BaitBreak analysis failed:", error);

    showError(
      tr(
        "Unable to analyze this message. Check that the BaitBreak server is running. ",
        "इस संदेश की जाँच नहीं हो सकी। देखें कि BaitBreak सर्वर चल रहा है। "
      ) + (error.message || "")
    );
  } finally {
    setLoading(false);
    scanAnimation.hidden = true;
  }
});

/* ---------- LOADING + ERROR ---------- */

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  buttonLabel.hidden = isLoading;
  buttonSpinner.hidden = !isLoading;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

/* ---------- RISK LEVELS ---------- */

const HIGH_LEVELS = ["HIGH", "CRITICAL", "DANGEROUS"];
const MEDIUM_LEVELS = ["MEDIUM", "SUSPICIOUS", "MODERATE"];
const LOW_LEVELS = ["LOW", "SAFE"];

function getLevelClass(level) {
  if (HIGH_LEVELS.includes(level)) return "high";
  if (MEDIUM_LEVELS.includes(level)) return "medium";
  if (LOW_LEVELS.includes(level)) return "low";
  return "unsure";
}

const hindiBadges = {
  HIGH: "उच्च जोखिम",
  CRITICAL: "गंभीर",
  DANGEROUS: "खतरनाक",
  MEDIUM: "मध्यम जोखिम",
  SUSPICIOUS: "संदिग्ध",
  MODERATE: "मध्यम जोखिम",
  LOW: "कम जोखिम",
  SAFE: "कम जोखिम",
  CANT_CONFIRM: "पुष्टि नहीं"
};

/* ---------- WARNING SIGNAL TEXT (Hindi) ---------- */

const signalTranslations = {
  govt_benefit_claim: [
    "सरकारी योजना या पैसे मिलने का दावा",
    "संदेश कहता है कि आपको सरकारी योजना का पैसा, सब्सिडी या रिफंड मिलेगा। सिर्फ इस संदेश के आधार पर भरोसा न करें—योजना की जानकारी सरकारी वेबसाइट या नजदीकी सरकारी कार्यालय से खुद जाँचें।"
  ],
  urgency: [
    "तुरंत कार्रवाई करने का दबाव",
    "संदेश आपको जल्दी करने के लिए कहता है ताकि आप बिना जाँच किए लिंक खोलें, पैसे भेजें या जानकारी साझा कर दें। पहले रुकें और पुष्टि करें।"
  ],
  apk_install_request: [
    "अनजान APK ऐप इंस्टॉल करने को कहा गया",
    "संदेश आपको मैसेज से मिली APK फाइल इंस्टॉल करने के लिए कहता है। ऐसी फाइल फोन का डेटा चुरा सकती है या फोन पर गलत काम कर सकती है। इसे इंस्टॉल न करें।"
  ],
  prize_or_reward_claim: [
    "इनाम या मुफ्त पैसे मिलने का दावा",
    "संदेश इनाम, पुरस्कार या मुफ्त पैसे मिलने का दावा करता है। कोई भी फीस न दें और बैंक या पहचान की जानकारी साझा न करें; पहले आधिकारिक स्रोत से जाँचें।"
  ],
  account_block_threat: [
    "खाता बंद करने की धमकी",
    "संदेश कहता है कि तुरंत कार्रवाई नहीं की तो आपका बैंक या अन्य खाता बंद हो जाएगा। डरकर लिंक न खोलें और OTP या पासवर्ड न दें। संबंधित संस्था से उसके आधिकारिक नंबर या वेबसाइट पर संपर्क करें।"
  ],
  suspicious_link: [
    "लिंक की पुष्टि नहीं हुई है",
    "इस लिंक के असली होने की पुष्टि नहीं है। इसे न खोलें। संबंधित सरकारी विभाग या संस्था की वेबसाइट का पता खुद लिखकर खोलें।"
  ],
  otp_request: [
    "OTP या गुप्त जानकारी माँगी गई",
    "संदेश आपसे OTP, PIN या पासवर्ड माँगता है। ये जानकारी किसी को न बताएँ—सरकारी कर्मचारी या बैंक कर्मचारी को भी नहीं।"
  ]
};

/* Add more rule IDs here (e.g. R03: "prize_or_reward_claim") to get specific Hindi text */
const ruleIdMap = {
  R01: "govt_benefit_claim",
  R07: "urgency",
  R08: "account_block_threat",
  R12: "apk_install_request",
  R19: "otp_request"
};

function getSignalKey(hit) {
  const raw = String(hit.id || hit.ruleId || hit.code || "");
  const lower = raw.toLowerCase();

  if (signalTranslations[lower]) return lower;
  return ruleIdMap[raw.toUpperCase()] || "";
}

function translateSignal(hit, field) {
  if (!isHindi()) {
    return field === "title"
      ? (hit.name || hit.id || "Warning signal")
      : (hit.reason || "This message matches a configured warning pattern.");
  }

  const translated = signalTranslations[getSignalKey(hit)];
  if (translated) return translated[field === "title" ? 0 : 1];

  const original = field === "title" ? hit.name : hit.reason;

  if (typeof original === "string" && /[\u0900-\u097F]/.test(original)) {
    return original;
  }

  return field === "title"
    ? "चेतावनी का संकेत मिला"
    : "संदेश में एक ऐसा पैटर्न मिला है जिस पर ध्यान देना चाहिए।";
}

/* ---------- SAFETY ACTION TEXT (Hindi) ---------- */

function translateAction(action) {
  if (!isHindi() || typeof action !== "string") return action;
  if (/[\u0900-\u097F]/.test(action)) return action;

  const text = action.toLowerCase();

  if (/report|1930|cybercrime/.test(text)) {
    return "धोखाधड़ी हो गई हो तो तुरंत 1930 पर कॉल करें या cybercrime.gov.in पर रिपोर्ट करें।";
  }

  if (/\bapk\b|install/.test(text)) {
    return "अनजान संदेशों में भेजी गई APK फाइल या ऐप इंस्टॉल न करें।";
  }

  if (/\botp\b|\bpin\b|password|\bcvv\b/.test(text)) {
    return "अपना OTP, PIN, पासवर्ड या बैंकिंग जानकारी किसी के साथ साझा न करें।";
  }

  if (/link|website|\burl\b|verify|official/.test(text)) {
    return "अनजान लिंक पर क्लिक करने के बजाय आधिकारिक वेबसाइट खुद खोलें और जानकारी की पुष्टि करें।";
  }

  if (/bank|money|payment|transfer/.test(text)) {
    return "पैसे भेजने से पहले भेजने वाले की पहचान किसी आधिकारिक स्रोत से जाँचें।";
  }

  return "किसी भी कार्रवाई से पहले जानकारी की पुष्टि किसी भरोसेमंद आधिकारिक स्रोत से करें।";
}

/* ---------- RISK TITLE + SUMMARY ---------- */

function getRiskTitle(level) {
  if (level === "CANT_CONFIRM") {
    return tr("Not enough evidence", "पर्याप्त जानकारी नहीं है");
  }

  if (HIGH_LEVELS.includes(level)) {
    return tr("Potentially dangerous message", "यह संदेश खतरनाक हो सकता है");
  }

  if (MEDIUM_LEVELS.includes(level)) {
    return tr("Warning signs detected", "चेतावनी के संकेत मिले हैं");
  }

  if (LOW_LEVELS.includes(level)) {
    return tr("Fewer warning signs detected", "कम चेतावनी संकेत मिले हैं");
  }

  return tr("Analysis complete", "जाँच पूरी हुई");
}

function getRiskSummary(level) {
  if (level === "CANT_CONFIRM") {
    return tr(
      "There is not enough evidence to decide either way. This is not a confirmation that the message is safe.",
      "यह तय करने के लिए पर्याप्त जानकारी नहीं है कि संदेश सुरक्षित है या नहीं। इसका मतलब यह नहीं है कि संदेश सुरक्षित है।"
    );
  }

  if (HIGH_LEVELS.includes(level)) {
    return tr(
      "Avoid clicking links, installing files, sending money or sharing sensitive information without independent verification.",
      "बिना जाँच किए लिंक पर क्लिक न करें, फाइल इंस्टॉल न करें, पैसे न भेजें और निजी जानकारी साझा न करें।"
    );
  }

  if (MEDIUM_LEVELS.includes(level)) {
    return tr(
      "Pause and verify the sender and claims through a trusted, independent source.",
      "रुकें और किसी भरोसेमंद आधिकारिक स्रोत से भेजने वाले और संदेश के दावों की जाँच करें।"
    );
  }

  if (LOW_LEVELS.includes(level)) {
    return tr(
      "The checks found fewer warning signs. This does not guarantee that the message is safe.",
      "जाँच में कम चेतावनी संकेत मिले हैं। फिर भी इसकी पूरी सुरक्षा की गारंटी नहीं है।"
    );
  }

  return tr(
    "Review the detected signals and verify important claims independently.",
    "मिले हुए संकेतों को ध्यान से देखें और जरूरी जानकारी की आधिकारिक स्रोत से पुष्टि करें।"
  );
}

/* ---------- RENDER RESULTS ---------- */

function renderResults(data) {
  const risk = data.risk || {};
  const explanation = data.explanation || {};
  const extraction = data.extraction || {};
  const ruleHits = Array.isArray(extraction.ruleHits) ? extraction.ruleHits : [];

  const score = Number(risk.score);
  const hasScore = risk.score !== null && risk.score !== undefined && Number.isFinite(score);
  const safeScore = hasScore ? Math.max(0, Math.min(100, score)) : 0;

  const level = String(risk.level || explanation.level || "UNKNOWN").toUpperCase();
  const levelClass = getLevelClass(level);

  document.getElementById("risk-score").textContent = hasScore ? safeScore : "—";

  const gauge = document.getElementById("risk-gauge");
  const gaugeProgress = document.getElementById("gauge-progress");

  if (gauge && gaugeProgress) {
    const radius = gaugeProgress.r ? gaugeProgress.r.baseVal.value : 68;
    const circumference = 2 * Math.PI * radius;

    gauge.className = `risk-gauge ${levelClass}`;
    gaugeProgress.style.strokeDasharray = circumference;
    gaugeProgress.style.strokeDashoffset = circumference * (1 - safeScore / 100);
  }

  const threatProgress = document.getElementById("threat-progress");
  if (threatProgress) {
    threatProgress.style.width = `${safeScore}%`;
    threatProgress.className = `threat-progress threat-${levelClass}`;
  }

  const badge = document.getElementById("risk-badge");
  if (badge) {
    badge.textContent = isHindi()
      ? (hindiBadges[level] || level)
      : (level === "CANT_CONFIRM" ? "CAN'T CONFIRM" : level);
    badge.className = `risk-badge ${levelClass}`;
  }

  const riskTitle = document.getElementById("risk-title");
  const riskSummary = document.getElementById("risk-summary");

  if (riskTitle) riskTitle.textContent = getRiskTitle(level);
  if (riskSummary) riskSummary.textContent = getRiskSummary(level);

  renderSignals(ruleHits);
  renderExplanation(explanation, ruleHits, level);

  renderActions(
    explanation.safeActions ||
    explanation.actions ||
    data.safeActions ||
    []
  );

  updateWarningCard();
}

document.addEventListener("baitbreak:languagechange", () => {
  if (lastAnalysisData) renderResults(lastAnalysisData);
});

/* ---------- DETECTED SIGNALS ---------- */

function renderSignals(ruleHits) {
  const container = document.getElementById("signals-list");
  if (!container) return;

  container.replaceChildren();

  if (!Array.isArray(ruleHits) || ruleHits.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-signals";
    empty.textContent = tr(
      "No configured warning signals were detected. Scams can still use wording that these checks do not recognize.",
      "जाँचे गए नियमों के अनुसार कोई चेतावनी संकेत नहीं मिला। फिर भी कुछ धोखाधड़ी वाले संदेश इन जाँचों से छूट सकते हैं।"
    );
    container.appendChild(empty);
    return;
  }

  ruleHits.forEach((hit) => {
    const item = document.createElement("article");
    item.className = "signal-item";

    const title = document.createElement("p");
    title.className = "signal-title";
    title.textContent = translateSignal(hit, "title");

    const reason = document.createElement("p");
    reason.className = "signal-reason";
    reason.textContent = translateSignal(hit, "reason");

    const tag = document.createElement("span");
    tag.className = "signal-tag";
    tag.textContent =
      `${hit.stage || "SIGNAL"}${hit.observed ? ` · "${hit.observed}"` : ""}`;

    item.append(title, reason, tag);
    container.appendChild(item);
  });
}

/* ---------- EXPLANATION ---------- */

const hindiExplanations = {
  govt_benefit_claim:
    "इस संदेश में सरकारी योजना या सब्सिडी का दावा है। योजना की पुष्टि खुद सरकारी वेबसाइट या सरकारी कार्यालय से करें।",
  urgency:
    "संदेश आप पर जल्दी कार्रवाई करने का दबाव डालता है। जल्दबाज़ी न करें।",
  apk_install_request:
    "इसमें APK फाइल इंस्टॉल करने को कहा गया है। अनजान APK इंस्टॉल न करें।",
  prize_or_reward_claim:
    "इसमें इनाम या मुफ्त पैसे मिलने का दावा है। पैसे या निजी जानकारी देने से पहले पुष्टि करें।",
  account_block_threat:
    "इसमें खाता बंद होने की धमकी है। डरकर लिंक न खोलें और OTP साझा न करें।",
  suspicious_link:
    "इसमें ऐसा लिंक है जिसकी पुष्टि नहीं हुई है। लिंक खोलने के बजाय आधिकारिक वेबसाइट खुद खोलें।",
  otp_request:
    "इसमें OTP या गुप्त जानकारी माँगी गई है। OTP, PIN या पासवर्ड किसी के साथ साझा न करें।"
};

function renderExplanation(explanation, ruleHits = [], level = "UNKNOWN") {
  const element = document.getElementById("explanation-text");
  if (!element) return;

  if (isHindi()) {
    const keys = [...new Set(ruleHits.map(getSignalKey).filter(Boolean))];
    const lines = keys.map((key) => hindiExplanations[key]).filter(Boolean);

    if (lines.length > 0) {
      element.textContent = lines.join(" ");
      return;
    }

    element.textContent = LOW_LEVELS.includes(level)
      ? "जाँच में कोई पहचाना हुआ चेतावनी संकेत नहीं मिला। फिर भी यह सुरक्षा की गारंटी नहीं है। पैसे भेजने, लिंक खोलने या निजी जानकारी देने से पहले आधिकारिक स्रोत से पुष्टि करें।"
      : "BaitBreak ने संदेश में कुछ जोखिम संकेतों की जाँच की है। कोई भी कदम उठाने से पहले भेजने वाले और संदेश के दावों की पुष्टि किसी आधिकारिक स्रोत से करें।";
    return;
  }

  const text = [
    explanation.explanation,
    explanation.summary,
    explanation.message,
    explanation.text
  ].find((candidate) => typeof candidate === "string" && candidate.trim());

  element.textContent =
    text ||
    "BaitBreak checks configured scam indicators. Verify the sender and any claimed government benefit through an official channel.";
}

/* ---------- SAFETY ACTIONS ---------- */

function renderActions(actions) {
  const list = document.getElementById("actions-list");
  if (!list) return;

  list.replaceChildren();

  if (typeof actions === "string") actions = [actions];

  if (!Array.isArray(actions) || actions.length === 0) {
    actions = [
      tr(
        "Do not share OTPs, PINs, passwords or banking details.",
        "अपना OTP, PIN, पासवर्ड या बैंकिंग जानकारी किसी के साथ साझा न करें।"
      ),
      tr(
        "Avoid installing APK files sent through messages.",
        "मैसेज में भेजी गई APK फाइल इंस्टॉल न करें।"
      ),
      tr(
        "Visit the official website directly instead of following an unsolicited link.",
        "अनजान लिंक पर क्लिक करने के बजाय आधिकारिक वेबसाइट खुद खोलें।"
      )
    ];
  }

  actions.forEach((action) => {
    const item = document.createElement("li");

    if (typeof action === "string") {
      item.textContent = translateAction(action);
    } else if (action && typeof action.text === "string") {
      item.textContent = translateAction(action.text);
    } else if (action && typeof action.message === "string") {
      item.textContent = translateAction(action.message);
    } else {
      return;
    }

    list.appendChild(item);
  });
}

/* ---------- GUARDIAN CHAT ---------- */

const guardianTrigger = document.getElementById("guardian-trigger");
const guardianPanel = document.getElementById("guardian-panel");
const guardianClose = document.getElementById("guardian-close");
const guardianChat = document.getElementById("guardian-chat");

if (guardianTrigger && guardianPanel) {
  guardianTrigger.addEventListener("click", () => {
    guardianPanel.hidden = !guardianPanel.hidden;
  });
}

if (guardianClose && guardianPanel) {
  guardianClose.addEventListener("click", () => {
    guardianPanel.hidden = true;
  });
}

const guardianAnswers = {
  otp: [
    "Never share your OTP, PIN or password with anyone. Genuine officials should not ask you to reveal these secrets over a message or call.",
    "अपना OTP, PIN या पासवर्ड किसी को न बताएँ। असली अधिकारी मैसेज या कॉल पर ये जानकारी नहीं माँगते।"
  ],
  links: [
    "Check the complete website address carefully. Avoid shortened or unfamiliar links. Open the organisation's official website directly instead of clicking an unsolicited link.",
    "वेबसाइट का पूरा पता ध्यान से देखें। अनजान लिंक से बचें। संस्था की आधिकारिक वेबसाइट खुद खोलें।"
  ],
  apk: [
    "Do not install APK files received through unexpected messages. They may contain malicious software. Use trusted app stores and official sources.",
    "अनचाहे संदेशों से मिली APK फाइल इंस्टॉल न करें। उनमें नुकसानदायक सॉफ़्टवेयर हो सकता है।"
  ]
};

document.querySelectorAll(".guardian-questions button").forEach((button) => {
  button.addEventListener("click", () => {
    if (!guardianChat) return;

    const pair = guardianAnswers[button.dataset.question];

    const answer = pair
      ? tr(pair[0], pair[1])
      : tr(
          "Please choose one of the available safety topics.",
          "कृपया उपलब्ध सुरक्षा विषयों में से कोई एक चुनें।"
        );

    const userMessage = document.createElement("div");
    userMessage.className = "guardian-message";
    userMessage.style.marginBottom = "10px";
    userMessage.style.borderColor = "#087fbb";
    userMessage.textContent = button.textContent;

    const botMessage = document.createElement("div");
    botMessage.className = "guardian-message";
    botMessage.style.marginBottom = "12px";
    botMessage.textContent = answer;

    guardianChat.append(userMessage, botMessage);
    guardianChat.scrollTop = guardianChat.scrollHeight;
  });
});

/* ---------- SHAREABLE WARNING CARD ---------- */

function getWarningCardContent() {
  if (!lastAnalysisData) return null;

  const risk = lastAnalysisData.risk || {};
  const extraction = lastAnalysisData.extraction || {};

  const hits = Array.isArray(extraction.ruleHits)
    ? extraction.ruleHits
    : [];

  const level = String(risk.level || "UNKNOWN").toUpperCase();

  const score =
    risk.score !== null &&
    risk.score !== undefined &&
    Number.isFinite(Number(risk.score))
      ? Math.max(0, Math.min(100, Number(risk.score)))
      : null;

  const signalNames = hits.slice(0, 5).map((hit) => {
    const key = getSignalKey(hit);

    if (key && signalTranslations[key]) {
      return signalTranslations[key][0];
    }

    return String(hit.name || hit.id || "Warning signal");
  });

  const summary = level === "CANT_CONFIRM"
    ? tr(
        "Not enough evidence to confirm this message. Verify independently.",
        "इस संदेश की पुष्टि के लिए पर्याप्त जानकारी नहीं है। आधिकारिक स्रोत से जाँचें।"
      )
    : HIGH_LEVELS.includes(level)
      ? tr(
          "High-risk warning signs detected. Do not click, install, pay or share sensitive details.",
          "खतरे के संकेत मिले हैं। लिंक न खोलें, ऐप इंस्टॉल न करें, पैसे या निजी जानकारी साझा न करें।"
        )
      : MEDIUM_LEVELS.includes(level)
        ? tr(
            "Some warning signs were detected. Pause and verify through an official source.",
            "कुछ चेतावनी संकेत मिले हैं। रुकें और आधिकारिक स्रोत से पुष्टि करें।"
          )
        : tr(
            "Fewer configured warning signs were detected. This does not guarantee safety.",
            "कम चेतावनी संकेत मिले हैं। इसका मतलब पूरी सुरक्षा की गारंटी नहीं है।"
          );

  return {
    level,
    score,
    signalNames,
    summary
  };
}

/* ---------- UPDATE WARNING CARD ---------- */

function updateWarningCard() {
  const content = getWarningCardContent();

  if (!content) return;

  const status = document.getElementById("warning-card-status");
  const score = document.getElementById("warning-card-score");
  const summary = document.getElementById("warning-card-summary");
  const signals = document.getElementById("warning-card-signals");

  if (!status || !score || !summary || !signals) return;

  status.textContent =
    isHindi() && hindiBadges[content.level]
      ? hindiBadges[content.level]
      : content.level.replaceAll("_", " ");

  score.textContent =
    content.score === null ? "—" : String(content.score);

  summary.textContent = content.summary;

  signals.replaceChildren();

  if (content.signalNames.length) {
    content.signalNames.forEach((name) => {
      const chip = document.createElement("span");
      chip.textContent = name;
      signals.appendChild(chip);
    });
  } else {
    const chip = document.createElement("span");

    chip.textContent = tr(
      "No configured signals detected",
      "कोई पहचाना हुआ संकेत नहीं मिला"
    );

    signals.appendChild(chip);
  }
}

/* ---------- CANVAS TEXT WRAPPING (with ellipsis on overflow) ---------- */

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);

  const visible = lines.slice(0, maxLines);

  if (lines.length > maxLines) {
    let last = visible[maxLines - 1];

    while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }

    visible[maxLines - 1] = `${last}…`;
  }

  visible.forEach((text, index) => {
    ctx.fillText(text, x, y + index * lineHeight);
  });
}

/* ---------- DRAW WARNING CARD ---------- */

function drawWarningCardCanvas(content) {
  const canvas = document.createElement("canvas");

  canvas.width = 1080;
  canvas.height = 760;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 1080, 760);

  gradient.addColorStop(0, "#101a35");
  gradient.addColorStop(1, "#080d1b");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#7ff7ff";
  ctx.lineWidth = 4;

  ctx.strokeRect(24, 24, 1032, 712);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 54px Arial";
  ctx.fillText("BAIT", 70, 105);

  ctx.fillStyle = "#7ff7ff";
  ctx.fillText("BREAK", 205, 105);

  ctx.fillStyle = "#9eabc8";
  ctx.font = "22px Arial";
  ctx.fillText("DIGITAL SAFETY INTELLIGENCE", 70, 145);

  const high = HIGH_LEVELS.includes(content.level);
  const medium = MEDIUM_LEVELS.includes(content.level);

  ctx.fillStyle = high
    ? "#ff6b78"
    : medium
      ? "#ffd166"
      : "#7ff7ff";

  ctx.font = "bold 30px Arial";

  ctx.fillText(
    content.level.replaceAll("_", " "),
    70,
    235
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 100px Arial";

  ctx.fillText(
    content.score === null ? "—" : String(content.score),
    70,
    355
  );

  ctx.fillStyle = "#aebbd4";
  ctx.font = "24px Arial";
  ctx.fillText("/ 100 RISK SCORE", 245, 350);

  ctx.fillStyle = "#dbe5fa";
  ctx.font = "30px Arial";

  wrapCanvasText(
    ctx,
    content.summary,
    70,
    430,
    920,
    42,
    3
  );

  ctx.fillStyle = "#7ff7ff";
  ctx.font = "bold 24px Arial";

  ctx.fillText("DETECTED SIGNALS", 70, 585);

  ctx.fillStyle = "#ffffff";
  ctx.font = "22px Arial";

  const signalsText = content.signalNames.length
    ? content.signalNames.join("  •  ")
    : "No configured warning signals detected";

  wrapCanvasText(
    ctx,
    signalsText,
    70,
    630,
    920,
    34,
    2
  );

  ctx.strokeStyle = "rgba(255,255,255,.25)";

  ctx.beginPath();
  ctx.moveTo(70, 685);
  ctx.lineTo(1010, 685);
  ctx.stroke();

  ctx.fillStyle = "#9eabc8";
  ctx.font = "20px Arial";

  ctx.fillText(
    "PAUSE. VERIFY. PROTECT.  |  BaitBreak",
    70,
    715
  );

  return canvas;
}

/* ---------- DOWNLOAD WARNING CARD ---------- */

document.getElementById("download-warning-card")?.addEventListener("click", () => {
  const content = getWarningCardContent();

  if (!content) return;

  const canvas = drawWarningCardCanvas(content);

  const link = document.createElement("a");

  link.download = "baitbreak-warning-card.png";
  link.href = canvas.toDataURL("image/png");

  document.body.appendChild(link);
  link.click();
  link.remove();
});

/* ---------- SHARE ON WHATSAPP ---------- */

document.getElementById("share-warning-whatsapp")?.addEventListener("click", () => {
  const content = getWarningCardContent();

  if (!content) return;

  const scoreText =
    content.score === null
      ? "Unavailable"
      : `${content.score}/100`;

  const message = [
    "⚠️ BAITBREAK SAFETY WARNING",
    `Risk level: ${content.level.replaceAll("_", " ")}`,
    `Risk score: ${scoreText}`,
    content.summary,
    content.signalNames.length
      ? `Detected signals: ${content.signalNames.join(", ")}`
      : "",
    "Pause and verify through an official source. A low score does not guarantee safety."
  ]
    .filter(Boolean)
    .join("\n");

  window.open(
    `https://wa.me/?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
});