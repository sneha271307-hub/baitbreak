// baitbreakClient.js – tiny client for the BaitBreak Python ML service.
// Works with Node 18+ (uses the built-in fetch; no extra npm package needed).

// 127.0.0.1 is used instead of "localhost" to avoid IPv4/IPv6 resolution surprises on some machines.
const ML_URL = process.env.BAITBREAK_ML_URL || "http://127.0.0.1:8000";
const TIMEOUT_MS = Number(process.env.BAITBREAK_ML_TIMEOUT_MS || 5000);

/**
 * @param {string} message  SMS / WhatsApp / email text (Hindi, Hinglish or English)
 * @returns {Promise<{success: boolean, prediction?: "scam"|"legitimate", confidence?: number, error?: string}>}
 */
async function checkMessage(message) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
    return await res.json(); // 200 -> {success:true,...}; 400/422 -> {success:false,error}
  } catch (err) {
    // ML service down / timed out: don't crash the website – let the caller decide a fallback
    return { success: false, error: `ML service unavailable: ${err.name === "AbortError" ? "timeout" : err.message}` };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { checkMessage };
