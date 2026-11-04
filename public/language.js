// BaitBreak - English / Hindi language support
// English strings match index.html exactly, so English never rewrites the page.
// Strings are our own constants (they may contain markup such as <br>, <span>, icons).

const translations = {
  en: {
    // document
    pageTitle: "BaitBreak | Digital Safety Intelligence",
    metaDescription: "BaitBreak: detect suspicious messages, identify scam signals and stay protected online.",
    skipLink: "Skip to main content",
    brandTagline: "DIGITAL SAFETY INTELLIGENCE",

    // navbar
    home: "Home",
    scanner: "Scanner",
    protection: "Protection",
    startScanning: "Start Scanning",

    // hero
    heroEyebrow: "YOUR DIGITAL SAFETY COMPANION",
    heroTitle: "DON'T TRUST<br>EVERY <span>MESSAGE.</span>",
    heroDescription:
      "One suspicious message can put everything at risk. Detect scam signals, check suspicious links and protect yourself before you click.",
    heroPrimary: "Scan a Message",
    heroSecondary: "Explore Protection",
    heroFeature1: "Message intelligence",
    heroFeature2: "Scam signal detection",
    heroFeature3: "Simple safety guidance",
    visualCaption: "PAUSE. ANALYZE. PROTECT.",

    // feature bar
    feature1Title: "Message Analysis",
    feature1Text: "Identify suspicious wording",
    feature2Title: "Link Awareness",
    feature2Text: "Check suspicious URLs",
    feature3Title: "Safety Guidance",
    feature3Text: "Know what to do next",

    // scanner section
    scanEyebrow: "INTELLIGENT MESSAGE ANALYSIS",
    scanTitle: "Every message has a story.<br><span>Let's uncover it.</span>",
    scanDescription: "Paste a suspicious message below. BaitBreak will examine its warning signals.",
    scannerLabel: "BAITBREAK SCANNER / 001",
    scannerHeading: "Analyze a message",
    scannerSub: "Check before you trust. Your safety starts here.",
    engineReady: "INTELLIGENCE ENGINE READY",
    systemActive: "SYSTEM ACTIVE",
    exampleLabel: "Try an example:",
    example1: "Fake benefit",
    example2: "Bank KYC",
    example3: "Hinglish OTP",
    example4: "Genuine alert",
    inputLabel: "PASTE YOUR MESSAGE",
    placeholder:
      "Example: Congratulations! Your government subsidy is approved. Download this APK immediately to claim your benefit...",
    clear: "Clear message",
    scannerHint: "Your message is analyzed for configured scam warning signs.",
    analyze: "INITIATE SCAN",
    scanningTitle: "Analyzing message...",
    scanningText: "Examining suspicious patterns and warning signals.",

    // results
    reportLabel: "THREAT INTELLIGENCE REPORT",
    reportTitle: "Analysis complete",
    threatScore: "THREAT SCORE",
    riskScore: "RISK SCORE",
    section1: "01 / DETECTED WARNING SIGNALS",
    section2: "02 / THREAT EXPLANATION",
    section3: "03 / RECOMMENDED ACTIONS",
    disclaimer:
      "BaitBreak identifies configured warning signs. A low score does not guarantee that a message is safe. Verify important claims through official channels.",
    low: "LOW RISK",
    medium: "MEDIUM RISK",
    high: "HIGH RISK",
    critical: "CRITICAL RISK",
    unsure: "UNSURE",

    // protection
    protectionEyebrow: "YOUR DIGITAL DEFENCE",
    protectionTitle: "Small precautions.<br><span>Stronger protection.</span>",
    protectionDescription: "Recognize common tactics used in suspicious messages.",
    card1Label: "01 / OTP SAFETY",
    card1Title: "Never share your OTP",
    card1Text:
      "Never reveal your OTP, PIN or password, even if someone claims to represent a government department or bank.",
    card2Label: "02 / LINK SAFETY",
    card2Title: "Question unknown links",
    card2Text:
      "Look carefully at website addresses. A familiar-looking name does not automatically mean a website is genuine.",
    card3Label: "03 / APK SAFETY",
    card3Title: "Avoid unknown APKs",
    card3Text:
      "Do not install applications sent through unsolicited messages. Use trusted app stores and official sources.",

    // safety banner
    bannerEyebrow: "A REMINDER FROM BAITBREAK",
    safetyTitle: "Pause before you trust.<br><span>Check before you click.</span>",
    bannerButton: "Check a Message",

    // footer
    footer1: "Digital safety intelligence for everyone.",
    footer2: "Built to encourage safer digital decisions.",
    footer3:
      'Already shared an OTP or sent money? Call <strong>1930</strong> or report at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">cybercrime.gov.in</a>.'
  },

  hi: {
    // document
    pageTitle: "BaitBreak | डिजिटल सुरक्षा इंटेलिजेंस",
    metaDescription:
      "BaitBreak: संदिग्ध संदेशों की जाँच करें, धोखाधड़ी के संकेत पहचानें और ऑनलाइन सुरक्षित रहें।",
    skipLink: "मुख्य सामग्री पर जाएँ",
    brandTagline: "डिजिटल सुरक्षा इंटेलिजेंस",

    // navbar
    home: "होम",
    scanner: "स्कैनर",
    protection: "सुरक्षा",
    startScanning: "स्कैन शुरू करें",

    // hero
    heroEyebrow: "आपका डिजिटल सुरक्षा साथी",
    heroTitle: "हर संदेश पर<br>भरोसा <span>न करें।</span>",
    heroDescription:
      "एक संदिग्ध संदेश आपका सब कुछ खतरे में डाल सकता है। क्लिक करने से पहले धोखाधड़ी के संकेत पहचानें, संदिग्ध लिंक जाँचें और खुद को सुरक्षित रखें।",
    heroPrimary: "संदेश स्कैन करें",
    heroSecondary: "सुरक्षा देखें",
    heroFeature1: "संदेश विश्लेषण",
    heroFeature2: "धोखाधड़ी संकेतों की पहचान",
    heroFeature3: "सरल सुरक्षा सलाह",
    visualCaption: "रुकें। जाँचें। सुरक्षित रहें।",

    // feature bar
    feature1Title: "संदेश विश्लेषण",
    feature1Text: "संदिग्ध शब्दों की पहचान करें",
    feature2Title: "लिंक की जानकारी",
    feature2Text: "संदिग्ध URL जाँचें",
    feature3Title: "सुरक्षा मार्गदर्शन",
    feature3Text: "जानें आगे क्या करना है",

    // scanner section
    scanEyebrow: "स्मार्ट संदेश विश्लेषण",
    scanTitle: "हर संदेश की एक कहानी होती है।<br><span>आइए उसे उजागर करें।</span>",
    scanDescription: "नीचे संदिग्ध संदेश पेस्ट करें। BaitBreak उसके चेतावनी संकेतों की जाँच करेगा।",
    scannerLabel: "BAITBREAK स्कैनर / 001",
    scannerHeading: "संदेश की जाँच करें",
    scannerSub: "भरोसा करने से पहले जाँचें। आपकी सुरक्षा यहीं से शुरू होती है।",
    engineReady: "इंटेलिजेंस इंजन तैयार",
    systemActive: "सिस्टम सक्रिय",
    exampleLabel: "उदाहरण आज़माएँ:",
    example1: "फर्जी लाभ",
    example2: "बैंक KYC",
    example3: "हिंग्लिश OTP",
    example4: "असली अलर्ट",
    inputLabel: "अपना संदेश पेस्ट करें",
    placeholder:
      "उदाहरण: बधाई हो! आपकी सरकारी सब्सिडी मंज़ूर हो गई है। लाभ पाने के लिए तुरंत यह APK डाउनलोड करें...",
    clear: "संदेश मिटाएँ",
    scannerHint: "आपके संदेश की जाँच पहले से तय धोखाधड़ी के चेतावनी संकेतों के आधार पर की जाती है।",
    analyze: "स्कैन शुरू करें",
    scanningTitle: "संदेश की जाँच हो रही है...",
    scanningText: "संदिग्ध पैटर्न और चेतावनी संकेतों की जाँच की जा रही है।",

    // results
    reportLabel: "थ्रेट इंटेलिजेंस रिपोर्ट",
    reportTitle: "जाँच पूरी हुई",
    threatScore: "खतरे का स्कोर",
    riskScore: "जोखिम स्कोर",
    section1: "01 / पहचाने गए चेतावनी संकेत",
    section2: "02 / खतरे की व्याख्या",
    section3: "03 / सुझाई गई कार्रवाई",
    disclaimer:
      "BaitBreak पहले से तय चेतावनी संकेतों की पहचान करता है। कम स्कोर का मतलब यह नहीं कि संदेश सुरक्षित है। ज़रूरी दावों की पुष्टि आधिकारिक माध्यमों से करें।",
    low: "कम जोखिम",
    medium: "मध्यम जोखिम",
    high: "उच्च जोखिम",
    critical: "गंभीर जोखिम",
    unsure: "अनिश्चित",

    // protection
    protectionEyebrow: "आपकी डिजिटल रक्षा",
    protectionTitle: "छोटी सावधानियाँ।<br><span>मज़बूत सुरक्षा।</span>",
    protectionDescription: "संदिग्ध संदेशों में इस्तेमाल होने वाली आम चालों को पहचानें।",
    card1Label: "01 / OTP सुरक्षा",
    card1Title: "अपना OTP कभी साझा न करें",
    card1Text:
      "कोई खुद को सरकारी विभाग या बैंक का प्रतिनिधि बताए, तब भी अपना OTP, PIN या पासवर्ड कभी न बताएँ।",
    card2Label: "02 / लिंक सुरक्षा",
    card2Title: "अनजान लिंक पर सवाल उठाएँ",
    card2Text:
      "वेबसाइट का पता ध्यान से देखें। जाना-पहचाना नाम होने का मतलब यह नहीं कि वेबसाइट असली है।",
    card3Label: "03 / APK सुरक्षा",
    card3Title: "अनजान APK से बचें",
    card3Text:
      "बिना माँगे आए संदेशों के ज़रिए मिले ऐप इंस्टॉल न करें। भरोसेमंद ऐप स्टोर और आधिकारिक स्रोतों का ही उपयोग करें।",

    // safety banner
    bannerEyebrow: "BAITBREAK की ओर से एक याद दिलाना",
    safetyTitle: "भरोसा करने से पहले रुकें।<br><span>क्लिक करने से पहले जाँचें।</span>",
    bannerButton: "संदेश जाँचें",

    // footer
    footer1: "सभी के लिए डिजिटल सुरक्षा इंटेलिजेंस।",
    footer2: "सुरक्षित डिजिटल फैसलों को बढ़ावा देने के लिए बनाया गया।",
    footer3:
      'OTP साझा कर दिया या पैसे भेज दिए? <strong>1930</strong> पर कॉल करें या <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">cybercrime.gov.in</a> पर रिपोर्ट करें।'
  }
};

// Which element gets which string. Strings are written with innerHTML,
// so spans, <br> and icons are rebuilt instead of being wiped out.
const ARROW = ' <span aria-hidden="true">↗</span>';
const ARROW_LONG = ' <span aria-hidden="true">⟶</span>';
const CLOSE = ' <span aria-hidden="true">×</span>';
const INFO = '<span aria-hidden="true">ⓘ</span> ';
const STAR = '<span aria-hidden="true">✦</span> ';
const DOT = '<span class="pulse-dot" aria-hidden="true"></span> ';

const bindings = [
  // skip link + navbar
  { sel: ".skip-link", key: "skipLink" },
  { sel: ".brand-name small", key: "brandTagline" },
  { sel: '.nav-links a[href="#home"]', key: "home" },
  { sel: '.nav-links a[href="#scanner"]', key: "scanner" },
  { sel: '.nav-links a[href="#protection"]', key: "protection" },
  { sel: ".nav-button", key: "startScanning", after: ARROW },

  // hero
  { sel: ".hero .eyebrow", key: "heroEyebrow", before: DOT },
  { sel: ".hero h1", key: "heroTitle" },
  { sel: ".hero-description", key: "heroDescription" },
  { sel: ".hero-buttons .primary-button", key: "heroPrimary", after: ARROW_LONG },
  { sel: ".hero-buttons .secondary-button", key: "heroSecondary" },
  { sel: ".hero-features li:nth-child(1)", key: "heroFeature1", before: STAR },
  { sel: ".hero-features li:nth-child(2)", key: "heroFeature2", before: STAR },
  { sel: ".hero-features li:nth-child(3)", key: "heroFeature3", before: STAR },
  { sel: ".visual-caption", key: "visualCaption" },

  // feature bar
  { sel: ".feature-bar > div:nth-child(1) strong", key: "feature1Title" },
  { sel: ".feature-bar > div:nth-child(1) small", key: "feature1Text" },
  { sel: ".feature-bar > div:nth-child(2) strong", key: "feature2Title" },
  { sel: ".feature-bar > div:nth-child(2) small", key: "feature2Text" },
  { sel: ".feature-bar > div:nth-child(3) strong", key: "feature3Title" },
  { sel: ".feature-bar > div:nth-child(3) small", key: "feature3Text" },

  // scanner heading
  { sel: "#scanner .section-heading .eyebrow", key: "scanEyebrow" },
  { sel: "#scanner .section-heading h2", key: "scanTitle" },
  { sel: "#scanner .section-heading p", key: "scanDescription" },

  // scanner card
  { sel: ".scanner-top .section-label", key: "scannerLabel" },
  { sel: ".scanner-top h2", key: "scannerHeading" },
  { sel: ".scanner-top p", key: "scannerSub" },
  { sel: ".scanner-status", key: "engineReady", before: '<span class="status-dot" aria-hidden="true"></span> ', afterKey: "systemActive", afterWrap: ' <span class="scanner-version">$</span>' },
  { sel: ".example-label", key: "exampleLabel" },
  { sel: ".example-chip:nth-of-type(1)", key: "example1" },
  { sel: ".example-chip:nth-of-type(2)", key: "example2" },
  { sel: ".example-chip:nth-of-type(3)", key: "example3" },
  { sel: ".example-chip:nth-of-type(4)", key: "example4" },
  { sel: 'label[for="message-input"]', key: "inputLabel" },
  { sel: "#message-input", key: "placeholder", attr: "placeholder" },
  { sel: "#clear-button", key: "clear", after: CLOSE },
  { sel: "#scanner-hint", key: "scannerHint", before: INFO },
  { sel: "#button-label", key: "analyze", after: ARROW },
  { sel: ".scan-animation h3", key: "scanningTitle" },
  { sel: ".scan-animation p", key: "scanningText" },

  // results (static labels only; signals, explanation and actions come from app.js)
  { sel: ".result-heading .section-label", key: "reportLabel" },
  { sel: ".result-heading h2", key: "reportTitle" },
  { sel: "#score-label", key: "threatScore" },
  { sel: ".gauge-content small", key: "riskScore" },
  { sel: ".result-section:nth-of-type(1) > h3", key: "section1" },
  { sel: ".result-section:nth-of-type(2) > h3", key: "section2" },
  { sel: ".result-section:nth-of-type(3) > h3", key: "section3" },
  { sel: ".disclaimer", key: "disclaimer" },

  // protection
  { sel: "#protection .section-heading .eyebrow", key: "protectionEyebrow" },
  { sel: "#protection .section-heading h2", key: "protectionTitle" },
  { sel: "#protection .section-heading p", key: "protectionDescription" },
  { sel: ".protection-card:nth-of-type(1) .card-number", key: "card1Label" },
  { sel: ".protection-card:nth-of-type(1) h3", key: "card1Title" },
  { sel: ".protection-card:nth-of-type(1) p", key: "card1Text" },
  { sel: ".protection-card:nth-of-type(2) .card-number", key: "card2Label" },
  { sel: ".protection-card:nth-of-type(2) h3", key: "card2Title" },
  { sel: ".protection-card:nth-of-type(2) p", key: "card2Text" },
  { sel: ".protection-card:nth-of-type(3) .card-number", key: "card3Label" },
  { sel: ".protection-card:nth-of-type(3) h3", key: "card3Title" },
  { sel: ".protection-card:nth-of-type(3) p", key: "card3Text" },

  // safety banner
  { sel: ".safety-banner .eyebrow", key: "bannerEyebrow" },
  { sel: ".safety-banner h2", key: "safetyTitle" },
  { sel: ".safety-banner .primary-button", key: "bannerButton", after: ARROW_LONG },

  // footer
  { sel: "footer p:nth-of-type(1)", key: "footer1" },
  { sel: "footer p:nth-of-type(2)", key: "footer2" },
  { sel: "footer p:nth-of-type(3)", key: "footer3" }
];

// ---------- state ----------

function readSavedLanguage() {
  try {
    const saved = localStorage.getItem("baitbreak-language");
    return translations[saved] ? saved : "en";
  } catch (e) {
    return "en";
  }
}

let currentLanguage = readSavedLanguage();

function t(key) {
  return translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
}

window.BaitBreakI18n = {
  translations,
  t,

  getLanguage() {
    return currentLanguage;
  },

  setLanguage(language) {
    if (!translations[language]) return;
    currentLanguage = language;
    try {
      localStorage.setItem("baitbreak-language", language);
    } catch (e) { /* storage blocked: language still switches for this visit */ }
    applyLanguage();
    // app.js can listen for this to re-render an open scan result
    document.dispatchEvent(
      new CustomEvent("baitbreak:languagechange", { detail: { language } })
    );
  }
};

// ---------- apply ----------

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title = t("pageTitle");

  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("metaDescription"));

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", t("pageTitle"));

  bindings.forEach((b) => {
    const el = document.querySelector(b.sel);
    if (!el) return;

    if (b.attr) {
      el.setAttribute(b.attr, t(b.key));
      return;
    }

    let html = (b.before || "") + t(b.key) + (b.after || "");
    if (b.afterKey) html += b.afterWrap.replace("$", t(b.afterKey));
    el.innerHTML = html;
  });

  // language button: shows the language you will switch TO
  const languageButton = document.getElementById("language-toggle");
  if (languageButton) {
    languageButton.innerHTML =
      currentLanguage === "en"
        ? '<span aria-hidden="true">文A</span> English'
        : '<span aria-hidden="true">文A</span> हिंदी';
    languageButton.setAttribute(
      "aria-label",
      currentLanguage === "en" ? "भाषा हिंदी में बदलें" : "Switch website language to English"
    );
  }
}

// ---------- init ----------

document.addEventListener("DOMContentLoaded", () => {
  let languageButton = document.getElementById("language-toggle");

  if (languageButton) {
    // Replacing the button with a copy removes any other click handler
    // (for example one in app.js) that also toggles the language.
    // Two toggles in a row cancel each other out, which looks like the
    // button working "opposite".
    const freshButton = languageButton.cloneNode(true);
    languageButton.replaceWith(freshButton);
    languageButton = freshButton;

    languageButton.addEventListener("click", (event) => {
      event.stopImmediatePropagation();
      const next = currentLanguage === "en" ? "hi" : "en";
      window.BaitBreakI18n.setLanguage(next);
    });
  }

  document.documentElement.lang = currentLanguage;

  // English already matches index.html, so only rewrite the page if Hindi was saved
  if (currentLanguage !== "en") applyLanguage();
});