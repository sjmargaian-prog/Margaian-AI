// ═══════════════════════════════════════════════════════
//  MARGAIAN INGESTION API
//  Handles deal ingestion from external sources
// ═══════════════════════════════════════════════════════
//
//  ARCHITECTURE:
//  In production, this runs as a Supabase Edge Function
//  or Vercel/Cloudflare serverless function.
//
//  Endpoint: /api/ingest?source=<source_name>
//
//  Supported sources (current + planned):
//  - manual: Direct entry via dashboard
//  - csv: Bulk CSV upload
//  - realestate_scanner: (future) MLS/Zillow/Redfin scraper
//  - startup_deals: (future) AngelList/Crunchbase feed
//  - macro_intel: (future) FRED/BLS/Treasury data
//  - alerts: (future) Automated opportunity alerts
//
// ═══════════════════════════════════════════════════════

import { computeScore, breakdownScore } from "../lib/scoring.js";

// Validate opportunity structure
function validateOpportunity(opp) {
  const required = ["name", "category", "location", "capitalRequired", "riskLevel", "marketGrowth", "capitalEfficiency", "timing", "strategicRelevance"];
  const missing = required.filter((k) => opp[k] === undefined || opp[k] === null);

  if (missing.length > 0) {
    return { valid: false, errors: missing.map((k) => `Missing field: ${k}`) };
  }

  if (!["Low", "Medium", "High"].includes(opp.riskLevel)) {
    return { valid: false, errors: ["Invalid riskLevel: must be Low, Medium, or High"] };
  }

  const numericFields = ["marketGrowth", "capitalEfficiency", "timing", "strategicRelevance"];
  for (const f of numericFields) {
    if (opp[f] < 0 || opp[f] > 100) {
      return { valid: false, errors: [`${f} must be between 0 and 100`] };
    }
  }

  return { valid: true, errors: [] };
}

// Process a batch of raw deals into scored opportunities
export function processBatch(rawDeals, source = "manual") {
  const results = { added: [], errors: [] };

  for (const deal of rawDeals) {
    const validation = validateOpportunity(deal);
    if (!validation.valid) {
      results.errors.push({ deal: deal.name || "unknown", errors: validation.errors });
      continue;
    }

    const scored = {
      ...deal,
      score: computeScore(deal),
      breakdown: breakdownScore(deal),
      source,
      status: "active",
      created_at: new Date().toISOString(),
    };

    results.added.push(scored);
  }

  return results;
}

// Parse CSV text into deal objects
export function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const deals = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const deal = {};
    headers.forEach((h, idx) => {
      const val = values[idx];
      // Auto-convert numeric fields
      if (["capitalRequired", "marketGrowth", "capitalEfficiency", "timing", "strategicRelevance"].includes(h)) {
        deal[h] = parseInt(val, 10);
      } else {
        deal[h] = val;
      }
    });
    deals.push(deal);
  }

  return deals;
}

// Source registry for future expansion
export const INGESTION_SOURCES = {
  manual: { name: "Manual Entry", status: "active", icon: "edit" },
  csv: { name: "CSV Upload", status: "active", icon: "upload" },
  realestate_scanner: { name: "Real Estate Scanner", status: "planned", icon: "building" },
  startup_deals: { name: "Startup Deal Sourcing", status: "planned", icon: "rocket" },
  macro_intel: { name: "Macro Intelligence", status: "planned", icon: "globe" },
  alerts: { name: "Automated Alerts", status: "planned", icon: "bell" },
};
