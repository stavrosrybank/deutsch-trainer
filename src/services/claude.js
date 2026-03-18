// claude.js — Anthropic API client for Deutsch Trainer

const MODEL = 'claude-sonnet-4-6';

const ANALYSIS_SYSTEM_PROMPT = `You are an encouraging German language teacher reviewing a student's written German.

Your job is NOT to correct every mistake — only surface the most impactful 2–4 patterns the student should focus on.

Focus areas (in order of priority):
- Article errors (der/die/das/dem/den)
- Verb placement (main clause vs. subordinate clause)
- Missing or awkward subordinate clauses (weil, dass, obwohl, wenn)
- Unnatural or overly literal phrasing

Return ONLY valid JSON — no markdown fences, no extra text — in this exact shape:
{
  "summary": "A warm 2–3 sentence summary of what went well",
  "corrections": [
    {
      "original": "the exact phrase the student wrote",
      "improved": "the better version",
      "explanation": "brief, friendly explanation of why",
      "category": "articles|structure|vocabulary|verbs|other"
    }
  ],
  "patternObservation": "A single encouraging sentence about a recurring pattern, or null if none"
}

Rules:
- Maximum 4 corrections. Fewer is fine if the writing is already good.
- Be warm, specific, and never overwhelming.
- If the text is very short or mostly correct, say so in the summary and return 0–1 corrections.
- The "original" field must be a substring of the student's text.`;

const PATTERN_REPORT_SYSTEM_PROMPT = `You are reviewing the last 5 German writing sessions for a language learner.

You will receive a list of corrections from those sessions. Identify the most recurring patterns.

Write a short, encouraging paragraph (3–5 sentences) directly addressing the learner:
- Name the main recurring challenge (be specific, e.g. "You often place the verb at the end of main clauses — that's a subordinate clause pattern bleeding in")
- Give one or two concrete, actionable suggestions
- End on an encouraging note

Do NOT return JSON. Return plain text only.`;

async function callClaude(apiKey, systemPrompt, userContent) {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey,
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = err?.error?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function analyzeWriting(apiKey, topic, userText) {
  const userContent = `Topic: "${topic.topic}" (category: ${topic.category})

Student's text:
${userText}`;

  const raw = await callClaude(apiKey, ANALYSIS_SYSTEM_PROMPT, userContent);

  // Strip any accidental markdown fences before parsing
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

export async function generatePatternReport(apiKey, recentSessions) {
  const correctionsList = recentSessions
    .flatMap((s) =>
      (s.analysis?.corrections || []).map(
        (c) => `- [${c.category}] "${c.original}" → "${c.improved}" (${c.explanation})`
      )
    )
    .join('\n');

  const userContent = `Here are the corrections from the last ${recentSessions.length} sessions:\n\n${correctionsList || '(No corrections recorded)'}`;

  return callClaude(apiKey, PATTERN_REPORT_SYSTEM_PROMPT, userContent);
}
