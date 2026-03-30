// storage.js — all localStorage CRUD for Deutsch Trainer

const KEYS = {
  SESSIONS: 'dt_sessions',
  PHRASES: 'dt_phrases',
  SETTINGS: 'dt_settings',
  PATTERN_REPORTS: 'dt_pattern_reports',
  VOCAB: 'dt_vocab',
  QUIZ_SESSIONS: 'dt_quiz_sessions',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Sessions ──────────────────────────────────────────────
export function getSessions() {
  return read(KEYS.SESSIONS, []);
}

export function saveSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  write(KEYS.SESSIONS, sessions);
}

// ── Phrases ───────────────────────────────────────────────
export function getPhrases() {
  return read(KEYS.PHRASES, []);
}

export function savePhrases(newPhrases) {
  const existing = getPhrases();
  write(KEYS.PHRASES, [...existing, ...newPhrases]);
}

export function updatePhrase(id, updates) {
  const phrases = getPhrases();
  write(
    KEYS.PHRASES,
    phrases.map((p) => (p.id === id ? { ...p, ...updates } : p))
  );
}

// ── Settings ──────────────────────────────────────────────
export function getSettings() {
  return read(KEYS.SETTINGS, {});
}

export function saveSettings(updates) {
  const current = getSettings();
  write(KEYS.SETTINGS, { ...current, ...updates });
}

// ── Pattern reports ───────────────────────────────────────
export function getPatternReports() {
  return read(KEYS.PATTERN_REPORTS, []);
}

export function savePatternReport(report) {
  const reports = getPatternReports();
  reports.push(report);
  write(KEYS.PATTERN_REPORTS, reports);
}

// ── Vocab ─────────────────────────────────────────────────
export function getVocab() {
  return read(KEYS.VOCAB, []);
}

export function saveVocab(entries) {
  write(KEYS.VOCAB, entries);
}

export function addVocabEntry(entry) {
  const vocab = getVocab();
  vocab.push(entry);
  write(KEYS.VOCAB, vocab);
}

export function updateVocabEntry(id, updates) {
  const vocab = getVocab();
  write(
    KEYS.VOCAB,
    vocab.map((v) => (v.id === id ? { ...v, ...updates } : v))
  );
}

export function deleteVocabEntry(id) {
  const vocab = getVocab();
  write(KEYS.VOCAB, vocab.filter((v) => v.id !== id));
}

// ── Quiz sessions ─────────────────────────────────────────
export function getQuizSessions() {
  return read(KEYS.QUIZ_SESSIONS, []);
}

export function saveQuizSession(session) {
  const sessions = getQuizSessions();
  sessions.push(session);
  write(KEYS.QUIZ_SESSIONS, sessions);
}

// ── Export / Import ───────────────────────────────────────
export function exportAllData() {
  const data = {
    exportedAt: new Date().toISOString(),
    dt_sessions: read(KEYS.SESSIONS, []),
    dt_phrases: read(KEYS.PHRASES, []),
    dt_settings: read(KEYS.SETTINGS, {}),
    dt_pattern_reports: read(KEYS.PATTERN_REPORTS, []),
    dt_vocab: read(KEYS.VOCAB, []),
    dt_quiz_sessions: read(KEYS.QUIZ_SESSIONS, []),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deutschtrainer-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (data.dt_sessions !== undefined) write(KEYS.SESSIONS, data.dt_sessions);
    if (data.dt_phrases !== undefined) write(KEYS.PHRASES, data.dt_phrases);
    if (data.dt_settings !== undefined) write(KEYS.SETTINGS, data.dt_settings);
    if (data.dt_pattern_reports !== undefined) write(KEYS.PATTERN_REPORTS, data.dt_pattern_reports);
    if (data.dt_vocab !== undefined) write(KEYS.VOCAB, data.dt_vocab);
    if (data.dt_quiz_sessions !== undefined) write(KEYS.QUIZ_SESSIONS, data.dt_quiz_sessions);
    return true;
  } catch {
    return false;
  }
}
