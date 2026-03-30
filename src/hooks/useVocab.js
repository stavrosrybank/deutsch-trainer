import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import {
  getVocab,
  saveVocab,
  addVocabEntry,
  updateVocabEntry,
  deleteVocabEntry,
  getQuizSessions,
  saveQuizSession,
} from '../services/storage';

function deriveStatus(correctStreak) {
  if (correctStreak >= 5) return 'learned';
  if (correctStreak >= 3) return 'review';
  return 'learning';
}

export function useVocab() {
  const [vocab, setVocab] = useState(() => getVocab());
  const [quizSessions, setQuizSessions] = useState(() => getQuizSessions());

  const refresh = useCallback(() => {
    setVocab(getVocab());
    setQuizSessions(getQuizSessions());
  }, []);

  const addWord = useCallback((fields) => {
    const streak = fields.correctStreak ?? 0;
    const entry = {
      id: uuid(),
      german: fields.german || '',
      english: fields.english || '',
      article: fields.article || null,
      plural: fields.plural || null,
      example: fields.example || '',
      difficulty: fields.difficulty || 'B1',
      correctStreak: streak,
      lastSeen: fields.lastSeen || null,
      status: deriveStatus(streak),
      addedDate: new Date().toISOString(),
    };
    addVocabEntry(entry);
    setVocab(getVocab());
    return entry;
  }, []);

  const updateWord = useCallback((id, updates) => {
    const streak = updates.correctStreak;
    const finalUpdates = streak !== undefined
      ? { ...updates, status: deriveStatus(streak) }
      : updates;
    updateVocabEntry(id, finalUpdates);
    setVocab(getVocab());
  }, []);

  const deleteWord = useCallback((id) => {
    deleteVocabEntry(id);
    setVocab(getVocab());
  }, []);

  const addManyWords = useCallback((entries) => {
    const existing = getVocab();
    const existingNorms = new Set(existing.map((v) => v.german.toLowerCase().trim()));

    const toAdd = entries
      .filter((e) => e.german && !existingNorms.has(e.german.toLowerCase().trim()))
      .map((e) => ({
        id: uuid(),
        german: e.german,
        english: e.english || '',
        article: e.article || null,
        plural: e.plural || null,
        example: e.example || '',
        difficulty: e.difficulty || 'B1',
        correctStreak: 0,
        lastSeen: null,
        status: 'learning',
        addedDate: new Date().toISOString(),
      }));

    saveVocab([...existing, ...toAdd]);
    setVocab(getVocab());
    return toAdd.length;
  }, []);

  // Returns words weighted by status for quiz selection
  const getQuizWords = useCallback((count = 10) => {
    const all = getVocab();
    if (!all.length) return [];

    const learning = all.filter((v) => v.status === 'learning');
    const review = all.filter((v) => v.status === 'review');
    const learned = all.filter((v) => v.status === 'learned');

    const pool = [];
    // Fill with learning words first (weight ~60%)
    pool.push(...learning);
    // Add review words (~30%)
    if (review.length) pool.push(...review, ...review.slice(0, Math.ceil(review.length * 0.5)));
    // Rarely add learned words (~10%)
    if (learned.length) pool.push(learned[Math.floor(Math.random() * learned.length)]);

    // Shuffle and dedupe by id, then take count
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const seen = new Set();
    const result = [];
    for (const w of shuffled) {
      if (!seen.has(w.id)) {
        seen.add(w.id);
        result.push(w);
      }
      if (result.length >= count) break;
    }

    // If not enough, pad with any remaining
    if (result.length < count) {
      for (const w of all) {
        if (!seen.has(w.id)) {
          seen.add(w.id);
          result.push(w);
        }
        if (result.length >= count) break;
      }
    }

    return result;
  }, []);

  const recordQuizSession = useCallback((totalQuestions, correctAnswers, wordsQuizzed) => {
    const session = {
      id: uuid(),
      date: new Date().toISOString(),
      totalQuestions,
      correctAnswers,
      wordsQuizzed,
    };
    saveQuizSession(session);
    setQuizSessions(getQuizSessions());
    return session;
  }, []);

  // Duplicate check for import preview
  const isDuplicate = useCallback((germanWord) => {
    const existing = getVocab();
    const norm = germanWord.toLowerCase().trim();
    return existing.some((v) => v.german.toLowerCase().trim() === norm);
  }, []);

  return {
    vocab,
    quizSessions,
    addWord,
    updateWord,
    deleteWord,
    addManyWords,
    getQuizWords,
    recordQuizSession,
    isDuplicate,
    refresh,
  };
}
