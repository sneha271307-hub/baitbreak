
const { analyzeMessage } = require("./engine/extract");

const message =
  "Your subsidy is approved. Download this APK immediately.";

console.log("\n--- BAITBREAK EXTRACTION TEST ---\n");

try {
  const result = analyzeMessage(message);

  console.log(JSON.stringify(result, null, 2));

  const detectedRules = result.ruleHits.map((hit) => hit.id);

  if (
    detectedRules.includes("R01") &&
    detectedRules.includes("R07") &&
    detectedRules.includes("R12")
  ) {
    console.log("\nTEST PASSED: All expected signals detected.\n");
  } else {
    console.log("\nTEST FAILED: Some expected signals are missing.");
    console.log("Detected rules:", detectedRules);
    process.exitCode = 1;
  }
} catch (error) {
  console.error("\nTEST FAILED:", error.stack || error.message);
  process.exitCode = 1;
}

