
// engine/correlate.js
// Combines extracted scam signals with sequence-pattern results.

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'sequence.json');
const CONFIG = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const LEVEL_RANK = {
  LOW: 0,
  CANT_CONFIRM: 1,
  SUSPICIOUS: 2,
  HIGH: 3
};

function correlateResults(extraction, sequenceResult) {
  const ruleHits = extraction.ruleHits || [];
  const uniqueRules = new Map();

  for (const hit of ruleHits) {
    if (!uniqueRules.has(hit.id)) {
      uniqueRules.set(hit.id, hit);
    }
  }

  const totalWeight = [...uniqueRules.values()].reduce(
    (sum, hit) => sum + (Number(hit.weight) || 0),
    0
  );

  const pattern = sequenceResult?.pattern || null;
  const patternBonus = pattern ? Number(pattern.bonus) || 0 : 0;

  const score = Math.min(100, totalWeight * 2 + patternBonus);

  let level = 'LOW';

  if (score >= CONFIG.scoreThresholds.highAtOrAbove) {
    level = 'HIGH';
  } else if (
    score >= CONFIG.scoreThresholds.suspiciousAtOrAbove
  ) {
    level = 'SUSPICIOUS';
  } else if (
    score >= CONFIG.scoreThresholds.cantConfirmAtOrAbove
  ) {
    level = 'CANT_CONFIRM';
  }

  // Apply the configured minimum-level floors.
  for (const floor of CONFIG.floors || []) {
    const matchesFloor =
      floor.ifAnyRule?.some((ruleId) => uniqueRules.has(ruleId));

    if (
      matchesFloor &&
      LEVEL_RANK[level] < LEVEL_RANK[floor.minimumLevel]
    ) {
      level = floor.minimumLevel;
    }
  }

  // A matched sequence pattern can raise the risk level.
  if (
    pattern &&
    LEVEL_RANK[pattern.level] > LEVEL_RANK[level]
  ) {
    level = pattern.level;
  }

  return {
    score,
    level,
    totalWeight,
    patternBonus,
    matchedPattern: pattern?.id || null,
    ruleHits: [...uniqueRules.values()]
  };
}

module.exports = { correlateResults };

