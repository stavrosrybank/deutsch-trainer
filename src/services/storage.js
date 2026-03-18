// storage.js — all localStorage CRUD for Deutsch Trainer

const KEYS = {
  SESSIONS: 'dt_sessions',
  PHRASES: 'dt_phrases',
  SETTINGS: 'dt_settings',
  PATTERN_REPORTS: 'dt_pattern_reports',
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

// Sessions
export function getSessions() {
  return read(KEYS.SESSIONS, []);
}

export function saveSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  write(KEYS.SESSIONS, sessions);
}

// Phrases
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

// Settings
export function getSettings() {
  return read(KEYS.SETTINGS, {});
}

export function saveSettings(updates) {
  const current = getSettings();
  write(KEYS.SETTINGS, { ...current, ...updates });
}

// Pattern reports
export function getPatternReports() {
  return read(KEYS.PATTERN_REPORTS, []);
}

export function savePatternReport(report) {
  const reports = getPatternReports();
  reports.push(report);
  write(KEYS.PATTERN_REPORTS, reports);
}
