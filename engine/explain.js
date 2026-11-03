
// engine/explain.js
// Converts detection results into a clear, user-friendly explanation.

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'sequence.json');
const CONFIG = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function explainResults(extraction, correlation) {
  const level = correlation.level || 'CANT_CONFIRM';
  const levelConfig = CONFIG.levels[level] || CONFIG.levels.CANT_CONFIRM;

  const ruleHits = correlation.ruleHits || extraction.ruleHits || [];

  const signals = ruleHits.map((hit) => ({
    ruleId: hit.id,
    name: hit.name,
    stage: hit.stage,
    observed: hit.observed,
    reason: hit.reason
  }));

  const explanationParts = [];

  if (signals.length > 0) {
    explanationParts.push(
      `BaitBreak detected ${signals.length} scam-related signal(s).`
    );

    for (const signal of signals) {
      explanationParts.push(
        `${signal.stage}: ${signal.reason} (observed: "${signal.observed}").`
      );
    }
  } else {
    explanationParts.push(
      'BaitBreak did not find any known scam-related signals in this message.'
    );
  }

  if (correlation.matchedPattern) {
    explanationParts.push(
      `The signals match attack pattern ${correlation.matchedPattern}.`
    );
  }

  return {
    level,
    label: levelConfig.label,
    explanation: explanationParts.join(' '),
    uncertainty: levelConfig.uncertainty,
    safeActions: levelConfig.safeActions || [],
    signals,
    score: correlation.score
  };
}

module.exports = { explainResults };

