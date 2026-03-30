// claude.js — Anthropic API client for Deutsch Trainer
// API key lives server-side in process.env.ANTHROPIC_API_KEY — never in the browser

const SONNET = 'claude-sonnet-4-6';
const HAIKU = 'claude-haiku-4-5-20251001';

// ── Prompts (unchanged) ───────────────────────────────────

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

const QUICK_ADD_SYSTEM_PROMPT = `You are a German dictionary assistant. Given a German word or phrase, return a JSON object with these fields:
- english: English translation
- article: "der", "die", "das", or null if not a noun
- plural: plural form with article (e.g. "die Häuser"), or null if not applicable
- example: one natural example sentence in German using this word
- difficulty: one of "A1", "A2", "B1", "B2" based on CEFR level

Return ONLY valid JSON, no markdown fences, no extra text.`;

const IMPORT_CLEAN_SYSTEM_PROMPT = `You are a German vocabulary assistant processing a list of words/phrases for a B1-B2 level learner.

Given an array of raw German words/phrases, return a cleaned JSON array. For each entry:
- Fix obvious spelling errors
- Add: english (translation), article (der/die/das or null), plural (with article, or null), example (one German sentence), difficulty (A1/A2/B1/B2)
- SKIP entries that are A1 level (very basic words the learner almost certainly knows: sein, haben, ich, du, gut, schlecht, etc.)
- SKIP duplicates within the batch

Return ONLY a valid JSON array of objects with fields: german, english, article, plural, example, difficulty
No markdown fences, no extra text, no explanation.`;

const QUIZ_QUESTION_SYSTEM_PROMPT = `You are a German language quiz generator. Given a vocab entry and a question type, generate a quiz question.

Question types:
- "translation": Ask for the English translation of the German word
- "article": Ask which article (der/die/das) this noun takes
- "fillblank": Give a sentence with the word blanked out, ask the learner to fill it in
- "plural": Ask for the plural form of the noun

Return ONLY valid JSON with these fields:
- question: the question text shown to the learner
- correctAnswer: the exact correct answer string
- explanation: a brief friendly explanation (1-2 sentences) shown after answering

No markdown fences, no extra text.`;

// ── Shared HTTP helper ────────────────────────────────────

async function callClaude(model, systemPrompt, userContent, maxTokens = 1024) {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
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

function stripFences(raw) {
  return raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

// ── Exports ───────────────────────────────────────────────

export async function analyzeWriting(topic, userText) {
  const userContent = `Topic: "${topic.topic}" (category: ${topic.category})\n\nStudent's text:\n${userText}`;
  const raw = await callClaude(SONNET, ANALYSIS_SYSTEM_PROMPT, userContent);
  return JSON.parse(stripFences(raw));
}

export async function generatePatternReport(recentSessions) {
  const correctionsList = recentSessions
    .flatMap((s) =>
      (s.analysis?.corrections || []).map(
        (c) => `- [${c.category}] "${c.original}" → "${c.improved}" (${c.explanation})`
      )
    )
    .join('\n');

  const userContent = `Here are the corrections from the last ${recentSessions.length} sessions:\n\n${correctionsList || '(No corrections recorded)'}`;
  return callClaude(SONNET, PATTERN_REPORT_SYSTEM_PROMPT, userContent);
}

export async function quickAddLookup(germanWord) {
  const raw = await callClaude(HAIKU, QUICK_ADD_SYSTEM_PROMPT, `German word or phrase: "${germanWord}"`, 512);
  return JSON.parse(stripFences(raw));
}

export async function importCleanBatch(rawLines) {
  const userContent = `Clean and enrich these German words/phrases:\n${JSON.stringify(rawLines)}`;
  const raw = await callClaude(HAIKU, IMPORT_CLEAN_SYSTEM_PROMPT, userContent, 4096);
  return JSON.parse(stripFences(raw));
}

export async function generateQuizQuestion(vocabEntry, questionType) {
  const userContent = `Vocab entry: ${JSON.stringify(vocabEntry)}\nQuestion type: "${questionType}"`;
  const raw = await callClaude(HAIKU, QUIZ_QUESTION_SYSTEM_PROMPT, userContent, 512);
  return JSON.parse(stripFences(raw));
}
