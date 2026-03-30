import { useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import {
  getVocab,
  addVocabEntry,
  insertManyVocabEntries,
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
  const [vocab, setVocab] = useState([]);
  const [quizSessions, setQuizSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    const [v, qs] = await Promise.all([getVocab(), getQuizSessions()]);
    setVocab(v);
    setQuizSessions(qs);
  }, []);

  useEffect(() => {
    refreshAll().finally(() => setLoading(false));
  }, [refreshAll]);

  const addWord = useCallback(async (fields) => {
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
    await addVocabEntry(entry);
    setVocab(await getVocab());
    return entry;
  }, []);

  const updateWord = useCallback(async (id, updates) => {
    const streak = updates.correctStreak;
    const finalUpdates = streak !== undefined
      ? { ...updates, status: deriveStatus(streak) }
      : updates;
    await updateVocabEntry(id, finalUpdates);
    setVocab(await getVocab());
  }, []);

  const deleteWord = useCallback(async (id) => {
    await deleteVocabEntry(id);
    setVocab(await getVocab());
  }, []);

  const addManyWords = useCallback(async (entries) => {
    const existingNorms = new Set(vocab.map((v) => v.german.toLowerCase().trim()));
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

    if (toAdd.length) {
      await insertManyVocabEntries(toAdd);
      setVocab(await getVocab());
    }
    return toAdd.length;
  }, [vocab]);

  // Uses in-memory vocab state — no storage call needed
  const getQuizWords = useCallback((count = 10) => {
    if (!vocab.length) return [];

    const learning = vocab.filter((v) => v.status === 'learning');
    const review = vocab.filter((v) => v.status === 'review');
    const learned = vocab.filter((v) => v.status === 'learned');

    const pool = [...learning];
    if (review.length) pool.push(...review, ...review.slice(0, Math.ceil(review.length * 0.5)));
    if (learned.length) pool.push(learned[Math.floor(Math.random() * learned.length)]);

    const shuffled = pool.sort(() => Math.random() - 0.5);
    const seen = new Set();
    const result = [];
    for (const w of shuffled) {
      if (!seen.has(w.id)) { seen.add(w.id); result.push(w); }
      if (result.length >= count) break;
    }
    if (result.length < count) {
      for (const w of vocab) {
        if (!seen.has(w.id)) { seen.add(w.id); result.push(w); }
        if (result.length >= count) break;
      }
    }
    return result;
  }, [vocab]);

  const recordQuizSession = useCallback(async (totalQuestions, correctAnswers, wordsQuizzed) => {
    const session = {
      id: uuid(),
      date: new Date().toISOString(),
      totalQuestions,
      correctAnswers,
      wordsQuizzed,
    };
    await saveQuizSession(session);
    setQuizSessions(await getQuizSessions());
    return session;
  }, []);

  // Uses in-memory vocab state
  const isDuplicate = useCallback((germanWord) => {
    const norm = germanWord.toLowerCase().trim();
    return vocab.some((v) => v.german.toLowerCase().trim() === norm);
  }, [vocab]);

  return {
    vocab,
    quizSessions,
    loading,
    addWord,
    updateWord,
    deleteWord,
    addManyWords,
    getQuizWords,
    recordQuizSession,
    isDuplicate,
    refresh: refreshAll,
  };
}
