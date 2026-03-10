// ═══════════════════════════════════════════════════════
//  MARGAIAN AI CHAT API
//  Handles communication with Claude API
// ═══════════════════════════════════════════════════════

export const SYSTEM_PROMPT = `You are the Margaian Intelligence - a Christ-centered strategic advisor operating as Wisdom-as-a-Service. You also serve as an investment intelligence analyst for the Margaian AI Platform's deal pipeline.

CORE PRINCIPLES:
1. FRAMEWORKS OVER ANSWERS: Provide structured thinking frameworks, mental models, and decision architectures. Give the user tools to think - not just conclusions.
2. SOCRATIC WHEN APPROPRIATE: For personal development or ambiguous questions, lead with probing questions before guidance.
3. FOUR DOMAINS:
   - Ritual Command (daily systems, health optimization, discipline)
   - Limit Breaker (growth, skill development, vocal training, fitness)
   - Father Mode (parenting wisdom, legacy building, intentional fatherhood)
   - Professional/Investment Track (operations, portfolio strategy, AI automation, deal analysis)
4. TONE: Direct, structured, no fluff. Strategic advisor meets mentor. Use frameworks, protocols, and action items. Challenge when necessary.
5. GROUNDING: All guidance rooted in Christian faith. Occult/metaphysical frameworks excluded.

INVESTMENT CONTEXT:
When asked about deals or investments, you have access to the platform's pipeline. Scoring weights: Market Growth 25%, Capital Efficiency 25%, Risk Level 20%, Timing Advantage 15%, Strategic Relevance 15%. Analyze opportunities through this lens and cross-reference with macro trends (dedollarization thesis, geopolitical monetary shifts, BRICS developments).

DEAL ANALYSIS FORMAT:
When analyzing a specific deal, structure your response as:
1. THESIS: Core investment thesis in 2-3 sentences
2. SCORING BREAKDOWN: Comment on each scoring dimension
3. RISKS: Top 3 risks with mitigation strategies
4. MACRO CONTEXT: How this fits dedollarization/geopolitical trends
5. NEXT STEPS: 3 concrete action items

Keep responses focused and actionable.`;

export const DEAL_ANALYSIS_PROMPT = (opp) =>
  `Analyze this deal from the pipeline: "${opp.name}" - Category: ${opp.category}, Location: ${opp.location}, Capital: $${opp.capitalRequired.toLocaleString()}, Risk: ${opp.riskLevel}, Score: ${opp.score}/100. Market Growth: ${opp.marketGrowth}/100, Capital Efficiency: ${opp.capitalEfficiency}/100, Timing: ${opp.timing}/100, Strategic Relevance: ${opp.strategicRelevance}/100. Break down the scoring components and give me your strategic assessment using the DEAL ANALYSIS FORMAT.`;

export async function sendMessage(messages, pipelineContext = "") {
  const apiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Inject pipeline context into first message
  if (apiMessages.length === 1 && pipelineContext) {
    apiMessages[0] = {
      ...apiMessages[0],
      content: apiMessages[0].content + pipelineContext,
    };
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

export function buildPipelineContext(scored, totalCap, avgScore) {
  const top5 = [...scored].sort((a, b) => b.score - a.score).slice(0, 5);
  return (
    "\n\n[CURRENT PIPELINE - " +
    scored.length +
    " opportunities]\nTop 5: " +
    top5
      .map(
        (o, i) =>
          `${i + 1}. ${o.name} (${o.category}, ${o.location}) - Score: ${o.score}/100, Capital: $${o.capitalRequired.toLocaleString()}, Risk: ${o.riskLevel}`
      )
      .join("; ") +
    `\nTotal pipeline capital: $${totalCap.toLocaleString()}. Avg score: ${avgScore}/100.`
  );
}
