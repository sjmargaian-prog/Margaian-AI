// ═══════════════════════════════════════════════════════
//  MARGAIAN SCORING ENGINE
//  Weights: Market Growth 25%, Capital Efficiency 25%,
//           Risk Level 20%, Timing 15%, Strategic 15%
// ═══════════════════════════════════════════════════════

export const SCORING_WEIGHTS = {
  marketGrowth: 0.25,
  capitalEfficiency: 0.25,
  riskLevel: 0.20,
  timing: 0.15,
  strategicRelevance: 0.15,
};

export const SCORING_LABELS = [
  ["Mkt Growth", "25%"],
  ["Cap Efficiency", "25%"],
  ["Risk Level", "20%"],
  ["Timing", "15%"],
  ["Strategic", "15%"],
];

const RISK_PENALTY = {
  Low: 20,
  Medium: 50,
  High: 80,
};

export function computeScore(opportunity) {
  const { marketGrowth, capitalEfficiency, riskLevel, timing, strategicRelevance } = opportunity;
  const riskScore = 100 - (RISK_PENALTY[riskLevel] || 50);

  const raw =
    marketGrowth * SCORING_WEIGHTS.marketGrowth +
    capitalEfficiency * SCORING_WEIGHTS.capitalEfficiency +
    riskScore * SCORING_WEIGHTS.riskLevel +
    timing * SCORING_WEIGHTS.timing +
    strategicRelevance * SCORING_WEIGHTS.strategicRelevance;

  return Math.round(raw);
}

export function scoreColor(score) {
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 45) return "#eab308";
  return "#ef4444";
}

export function scoreGrade(score) {
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C+";
  if (score >= 40) return "C";
  return "D";
}

export function breakdownScore(opportunity) {
  const riskScore = 100 - (RISK_PENALTY[opportunity.riskLevel] || 50);
  return {
    marketGrowth: { raw: opportunity.marketGrowth, weighted: Math.round(opportunity.marketGrowth * SCORING_WEIGHTS.marketGrowth) },
    capitalEfficiency: { raw: opportunity.capitalEfficiency, weighted: Math.round(opportunity.capitalEfficiency * SCORING_WEIGHTS.capitalEfficiency) },
    riskLevel: { raw: riskScore, weighted: Math.round(riskScore * SCORING_WEIGHTS.riskLevel) },
    timing: { raw: opportunity.timing, weighted: Math.round(opportunity.timing * SCORING_WEIGHTS.timing) },
    strategicRelevance: { raw: opportunity.strategicRelevance, weighted: Math.round(opportunity.strategicRelevance * SCORING_WEIGHTS.strategicRelevance) },
    total: computeScore(opportunity),
  };
}
