// storage.js — Supabase-backed data layer for Deutsch Trainer
// All functions are async. camelCase ↔ snake_case translation is handled here.

import { supabase } from './supabase';

// ── Auth helper ───────────────────────────────────────────

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user.id;
}

// ── Column mappers ────────────────────────────────────────

const toDb = {
  session: (s, userId) => ({
    id: s.id,
    user_id: userId,
    date: s.date,
    topic: s.topic,
    user_text: s.userText,
    analysis: s.analysis,
  }),
  phrase: (p, userId) => ({
    id: p.id,
    user_id: userId,
    session_id: p.sessionId,
    date: p.date,
    topic: p.topic,
    week: p.week,
    month: p.month,
    original: p.original,
    improved: p.improved,
    explanation: p.explanation,
    category: p.category,
    learned: p.learned ?? false,
  }),
  patternReport: (r, userId) => ({
    id: r.id,
    user_id: userId,
    date: r.date,
    session_ids: r.sessionIds,
    week: r.week,
    report: r.report,
  }),
  vocab: (v, userId) => ({
    id: v.id,
    user_id: userId,
    german: v.german,
    english: v.english,
    article: v.article,
    plural: v.plural,
    example: v.example,
    difficulty: v.difficulty,
    correct_streak: v.correctStreak ?? 0,
    last_seen: v.lastSeen ?? null,
    status: v.status,
    added_date: v.addedDate,
  }),
  quizSession: (s, userId) => ({
    id: s.id,
    user_id: userId,
    date: s.date,
    total_questions: s.totalQuestions,
    correct_answers: s.correctAnswers,
    words_quizzed: s.wordsQuizzed,
  }),
};

const fromDb = {
  session: (row) => ({
    id: row.id,
    date: row.date,
    topic: row.topic,
    userText: row.user_text,
    analysis: row.analysis,
  }),
  phrase: (row) => ({
    id: row.id,
    sessionId: row.session_id,
    date: row.date,
    topic: row.topic,
    week: row.week,
    month: row.month,
    original: row.original,
    improved: row.improved,
    explanation: row.explanation,
    category: row.category,
    learned: row.learned ?? false,
  }),
  patternReport: (row) => ({
    id: row.id,
    date: row.date,
    sessionIds: row.session_ids,
    week: row.week,
    report: row.report,
  }),
  vocab: (row) => ({
    id: row.id,
    german: row.german,
    english: row.english,
    article: row.article,
    plural: row.plural,
    example: row.example,
    difficulty: row.difficulty,
    correctStreak: row.correct_streak ?? 0,
    lastSeen: row.last_seen,
    status: row.status,
    addedDate: row.added_date,
  }),
  quizSession: (row) => ({
    id: row.id,
    date: row.date,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    wordsQuizzed: row.words_quizzed,
  }),
};

// ── Sessions ──────────────────────────────────────────────

export async function getSessions() {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data.map(fromDb.session);
}

export async function saveSession(session) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('practice_sessions')
    .insert(toDb.session(session, userId));
  if (error) throw error;
}

// ── Phrases ───────────────────────────────────────────────

export async function getPhrases() {
  const { data, error } = await supabase
    .from('phrase_log')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data.map(fromDb.phrase);
}

export async function savePhrases(newPhrases) {
  const userId = await getUserId();
  const rows = newPhrases.map((p) => toDb.phrase(p, userId));
  const { error } = await supabase.from('phrase_log').insert(rows);
  if (error) throw error;
}

export async function updatePhrase(id, updates) {
  const dbUpdates = {};
  if ('learned' in updates) dbUpdates.learned = updates.learned;
  const { error } = await supabase
    .from('phrase_log')
    .update(dbUpdates)
    .eq('id', id);
  if (error) throw error;
}

// ── Pattern reports ───────────────────────────────────────

export async function getPatternReports() {
  const { data, error } = await supabase
    .from('pattern_reports')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data.map(fromDb.patternReport);
}

export async function savePatternReport(report) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('pattern_reports')
    .insert(toDb.patternReport(report, userId));
  if (error) throw error;
}

// ── Vocab ─────────────────────────────────────────────────

export async function getVocab() {
  const { data, error } = await supabase
    .from('vocab_entries')
    .select('*')
    .order('added_date', { ascending: true });
  if (error) throw error;
  return data.map(fromDb.vocab);
}

export async function addVocabEntry(entry) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('vocab_entries')
    .insert(toDb.vocab(entry, userId));
  if (error) throw error;
}

export async function insertManyVocabEntries(entries) {
  const userId = await getUserId();
  const rows = entries.map((e) => toDb.vocab(e, userId));
  const { error } = await supabase.from('vocab_entries').insert(rows);
  if (error) throw error;
}

export async function updateVocabEntry(id, updates) {
  const dbUpdates = {};
  if ('correctStreak' in updates) dbUpdates.correct_streak = updates.correctStreak;
  if ('lastSeen' in updates) dbUpdates.last_seen = updates.lastSeen;
  if ('status' in updates) dbUpdates.status = updates.status;
  if ('german' in updates) dbUpdates.german = updates.german;
  if ('english' in updates) dbUpdates.english = updates.english;
  if ('article' in updates) dbUpdates.article = updates.article;
  if ('plural' in updates) dbUpdates.plural = updates.plural;
  if ('example' in updates) dbUpdates.example = updates.example;
  if ('difficulty' in updates) dbUpdates.difficulty = updates.difficulty;
  const { error } = await supabase
    .from('vocab_entries')
    .update(dbUpdates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteVocabEntry(id) {
  const { error } = await supabase
    .from('vocab_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Quiz sessions ─────────────────────────────────────────

export async function getQuizSessions() {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data.map(fromDb.quizSession);
}

export async function saveQuizSession(session) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('quiz_sessions')
    .insert(toDb.quizSession(session, userId));
  if (error) throw error;
}

// ── Settings (kept in localStorage — only stores non-sensitive prefs) ─────
// API key is gone. Nothing sensitive lives here any more.

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('dt_settings') || '{}');
  } catch {
    return {};
  }
}

export function saveSettings(updates) {
  const current = getSettings();
  localStorage.setItem('dt_settings', JSON.stringify({ ...current, ...updates }));
}

// ── Export / Import ───────────────────────────────────────

export async function exportAllData() {
  const [sessions, phrases, patternReports, vocab, quizSessions] = await Promise.all([
    getSessions(),
    getPhrases(),
    getPatternReports(),
    getVocab(),
    getQuizSessions(),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    dt_sessions: sessions,
    dt_phrases: phrases,
    dt_pattern_reports: patternReports,
    dt_vocab: vocab,
    dt_quiz_sessions: quizSessions,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deutschtrainer-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importAllData(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    const userId = await getUserId();

    if (data.dt_sessions?.length) {
      await supabase.from('practice_sessions').delete().eq('user_id', userId);
      await supabase.from('practice_sessions').insert(
        data.dt_sessions.map((s) => toDb.session(s, userId))
      );
    }
    if (data.dt_phrases?.length) {
      await supabase.from('phrase_log').delete().eq('user_id', userId);
      await supabase.from('phrase_log').insert(
        data.dt_phrases.map((p) => toDb.phrase(p, userId))
      );
    }
    if (data.dt_pattern_reports?.length) {
      await supabase.from('pattern_reports').delete().eq('user_id', userId);
      await supabase.from('pattern_reports').insert(
        data.dt_pattern_reports.map((r) => toDb.patternReport(r, userId))
      );
    }
    if (data.dt_vocab?.length) {
      await supabase.from('vocab_entries').delete().eq('user_id', userId);
      await supabase.from('vocab_entries').insert(
        data.dt_vocab.map((v) => toDb.vocab(v, userId))
      );
    }
    if (data.dt_quiz_sessions?.length) {
      await supabase.from('quiz_sessions').delete().eq('user_id', userId);
      await supabase.from('quiz_sessions').insert(
        data.dt_quiz_sessions.map((s) => toDb.quizSession(s, userId))
      );
    }
    return true;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
}
