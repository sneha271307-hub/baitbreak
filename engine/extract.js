// engine/extract.js
// Finds scam signals in ONE message. It never opens or fetches links.
// Links are treated as plain text; only their hostname and path are read.

const fs = require('fs');
const path = require('path');

const load = (name) =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', name), 'utf8')
  );

// These configurations are refreshed for every analysis.
let RULES;
let SEQ;
let TRUSTED;
let STAGE_ORDER;
let NEGATION_WORDS;
let NEGATION_WINDOW;
let URL_RULES;

function refreshConfig() {
  RULES = load('rules.json');
  SEQ = load('sequence.json');
  TRUSTED = load('trusted-domains.json');

  STAGE_ORDER = SEQ.stageOrder;
  NEGATION_WORDS = SEQ.negationWords;
  NEGATION_WINDOW = SEQ.negationWindowChars;

  URL_RULES = {};

  RULES.filter((r) => r.type === 'url_check').forEach((r) => {
    URL_RULES[r.check] = r;
  });
}

// File extensions that are not treated as website domains.
const FILE_EXTENSIONS = new Set([
  'apk', 'pdf', 'jpg', 'jpeg', 'png', 'exe',
  'zip', 'doc', 'docx', 'txt', 'mp4'
]);

// ---------- Helpers ----------

function normalize(text) {
  return String(text || '').toLowerCase().trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isNegated(text, pos) {
  const before = text.slice(
    Math.max(0, pos - NEGATION_WINDOW),
    pos
  );

  return NEGATION_WORDS.some((word) => before.includes(word));
}

function findKeyword(text, keyword, skipNegation = false) {
  let pattern = escapeRegex(keyword);

  if (/^[a-z0-9]/i.test(keyword)) {
    pattern = '(?<![a-z0-9])' + pattern;
  }

  if (/[a-z0-9]$/i.test(keyword)) {
    pattern += '(?![a-z0-9])';
  }

  const regex = new RegExp(pattern, 'gi');
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (skipNegation || !isNegated(text, match.index)) {
      return keyword;
    }
  }

  return null;
}

function levenshtein(a, b) {
  const dp = Array.from(
    { length: a.length + 1 },
    (_, i) => [i]
  );

  for (let j = 1; j <= b.length; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return dp[a.length][b.length];
}

// ---------- URL handling ----------

function extractUrls(text) {
  const regex =
    /(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/gi;

  const found = text.match(regex) || [];
  const urls = [];

  for (let raw of found) {
    raw = raw.replace(/[.,;:!?)]+$/, '');

    try {
      const url = new URL(
        /^https?:\/\//i.test(raw) ? raw : 'http://' + raw
      );

      const tld = url.hostname.split('.').pop();

      if (FILE_EXTENSIONS.has(tld)) continue;

      urls.push({
        host: url.hostname.toLowerCase(),
        path: url.pathname.toLowerCase()
      });
    } catch {
      // Ignore strings that cannot be parsed as URLs.
    }
  }

  return urls;
}

function isTrustedHost(host) {
  return TRUSTED.organisations.some((org) =>
    org.domains.some(
      (domain) =>
        host === domain || host.endsWith('.' + domain)
    )
  );
}

function isLookalike(host) {
  if (isTrustedHost(host)) return false;

  const labels = host.split(/[.-]/);

  for (const org of TRUSTED.organisations) {
    if (
      org.tokens.some((token) =>
        labels.some((label) => label.startsWith(token))
      )
    ) {
      return true;
    }

    if (
      host.length >= 8 &&
      org.domains.some(
        (domain) => levenshtein(host, domain) <= 2
      )
    ) {
      return true;
    }
  }

  return false;
}

// Runs URL checks for a single link.
function checkUrl(url) {
  const hits = [];

  const apkRule = URL_RULES.apk_link;

  if (apkRule && /\.apk$/i.test(url.path)) {
    hits.push({
      rule: apkRule,
      observed: url.path.split('/').pop()
    });
  }

  const shortened = URL_RULES.shortened_domain;

  if (
    shortened &&
    (shortened.domains || []).some(
      (domain) =>
        url.host === domain ||
        url.host.endsWith('.' + domain)
    )
  ) {
    hits.push({
      rule: shortened,
      observed: url.host
    });
  }

  const tldRule = URL_RULES.suspicious_tld;

  if (tldRule) {
    const tld = tldRule.tlds.find(
      (item) => url.host.endsWith(item)
    );

    if (tld) {
      hits.push({
        rule: tldRule,
        observed: tld
      });
    }
  }

  const lookalikeRule = URL_RULES.lookalike_domain;

  if (lookalikeRule && isLookalike(url.host)) {
    hits.push({
      rule: lookalikeRule,
      observed: url.host
    });
  }

  return hits;
}

// ---------- Main function ----------

function analyzeMessage(rawText) {
  // Reload configuration before every analysis.
  refreshConfig();

  const text = normalize(rawText);
  const hitsById = new Map();

  const addHit = (rule, observed) => {
    if (!rule) return;

    if (!hitsById.has(rule.id)) {
      hitsById.set(rule.id, {
        id: rule.id,
        name: rule.name,
        stage: rule.stage,
        weight: rule.weight,
        observed,
        reason: rule.reason
      });
    }
  };

  // 1. Match keyword rules.
  for (const rule of RULES.filter(
    (item) => item.type === 'keyword'
  )) {
    const skipNegation = rule.id === 'R10';

    for (const keyword of rule.keywords) {
      if (findKeyword(text, keyword, skipNegation)) {
        addHit(rule, keyword);
        break;
      }
    }

    // Recognise common variations of APK download requests.
    if (
      rule.id === 'R12' &&
      /\bdownload\s+(?:this|the|an?)\s+apk\b/i.test(text) &&
      !hitsById.has(rule.id)
    ) {
      const position = text.search(
        /\bdownload\s+(?:this|the|an?)\s+apk\b/i
      );

      if (!isNegated(text, position)) {
        addHit(rule, 'download this apk');
      }
    }
  }

  // 2. Match URL rules.
  const urls = extractUrls(text);

  for (const url of urls) {
    for (const { rule, observed } of checkUrl(url)) {
      addHit(rule, observed);
    }
  }

  const ruleHits = [...hitsById.values()];

  const stages = [
    ...new Set(ruleHits.map((hit) => hit.stage))
  ].sort(
    (a, b) =>
      STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b)
  );

  const shortenedDomains =
    URL_RULES.shortened_domain?.domains || [];

  const domains = [
    ...new Set(urls.map((url) => url.host))
  ].filter(
    (host) =>
      !shortenedDomains.some(
        (domain) =>
          host === domain || host.endsWith('.' + domain)
      )
  );

  return {
    text: rawText,
    stages,
    ruleHits,
    domains
  };
}

module.exports = {
  analyzeMessage,
  extractUrls,
  isLookalike,
  levenshtein,
  findKeyword
};