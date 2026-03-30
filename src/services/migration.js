// migration.js — one-time migration from localStorage to Supabase

import { supabase } from './supabase';

const LS_KEYS = {
  sessions: 'dt_sessions',
  phrases: 'dt_phrases',
  patternReports: 'dt_pattern_reports',
  vocab: 'dt_vocab',
  quizSessions: 'dt_quiz_sessions',
};

function readLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hasLocalStorageData() {
  return Object.values(LS_KEYS).some((key) => {
    const data = readLS(key);
    return Array.isArray(data) && data.length > 0;
  });
}

export async function migrateLocalStorageToSupabase() {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user.id;

  const sessions = readLS(LS_KEYS.sessions);
  const phrases = readLS(LS_KEYS.phrases);
  const patternReports = readLS(LS_KEYS.patternReports);
  const vocab = readLS(LS_KEYS.vocab);
  const quizSessions = readLS(LS_KEYS.quizSessions);

  const counts = { sessions: 0, phrases: 0, vocab: 0, quiz: 0 };

  if (sessions.length) {
    const { error } = await supabase.from('practice_sessions').upsert(
      sessions.map((s) => ({
        id: s.id, user_id: userId, date: s.date,
        topic: s.topic, user_text: s.userText, analysis: s.analysis,
      })),
      { onConflict: 'id' }
    );
    if (error) throw error;
    counts.sessions = sessions.length;
  }

  if (phrases.length) {
    const { error } = await supabase.from('phrase_log').upsert(
      phrases.map((p) => ({
        id: p.id, user_id: userId, session_id: p.sessionId,
        date: p.date, topic: p.topic, week: p.week, month: p.month,
        original: p.original, improved: p.improved, explanation: p.explanation,
        category: p.category, learned: p.learned ?? false,
      })),
      { onConflict: 'id' }
    );
    if (error) throw error;
    counts.phrases = phrases.length;
  }

  if (patternReports.length) {
    const { error } = await supabase.from('pattern_reports').upsert(
      patternReports.map((r) => ({
        id: r.id, user_id: userId, date: r.date,
        session_ids: r.sessionIds, week: r.week, report: r.report,
      })),
      { onConflict: 'id' }
    );
    if (error) throw error;
  }

  if (vocab.length) {
    const { error } = await supabase.from('vocab_entries').upsert(
      vocab.map((v) => ({
        id: v.id, user_id: userId, german: v.german, english: v.english,
        article: v.article, plural: v.plural, example: v.example,
        difficulty: v.difficulty, correct_streak: v.correctStreak ?? 0,
        last_seen: v.lastSeen ?? null, status: v.status, added_date: v.addedDate,
      })),
      { onConflict: 'id' }
    );
    if (error) throw error;
    counts.vocab = vocab.length;
  }

  if (quizSessions.length) {
    const { error } = await supabase.from('quiz_sessions').upsert(
      quizSessions.map((s) => ({
        id: s.id, user_id: userId, date: s.date,
        total_questions: s.totalQuestions, correct_answers: s.correctAnswers,
        words_quizzed: s.wordsQuizzed,
      })),
      { onConflict: 'id' }
    );
    if (error) throw error;
    counts.quiz = quizSessions.length;
  }

  // Clear localStorage after successful migration
  Object.values(LS_KEYS).forEach((key) => localStorage.removeItem(key));

  return counts;
}
