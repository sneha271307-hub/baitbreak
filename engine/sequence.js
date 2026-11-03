
// engine/sequence.js
// Matches detected scam signals against configured attack patterns.

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'sequence.json');
const CONFIG = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function analyzeSequence(ruleHits = []) {
  const ruleIds = new Set(ruleHits.map((hit) => hit.id));
  const stages = new Set(ruleHits.map((hit) => hit.stage));

  const matchedPatterns = [];

  for (const pattern of CONFIG.patterns || []) {
    const pathStages = pattern.path || [];

    // Every stage in the pattern must be present.
    const stagesMatch = pathStages.every((stage) => stages.has(stage));

    // If requiresAny exists, at least one required rule must be present.
    const requirementsMatch =
      !pattern.requiresAny ||
      pattern.requiresAny.some((ruleId) => ruleIds.has(ruleId));

    if (stagesMatch && requirementsMatch) {
      matchedPatterns.push({
        id: pattern.id,
        name: pattern.name,
        path: pattern.path,
        level: pattern.level,
        bonus: pattern.bonus,
        reason: pattern.reason
      });
    }
  }

  // The first matching pattern follows the configured priority order.
  const selectedPattern = matchedPatterns[0] || null;

  return {
    matched: selectedPattern !== null,
    pattern: selectedPattern,
    matchedPatterns
  };
}

module.exports = { analyzeSequence };
