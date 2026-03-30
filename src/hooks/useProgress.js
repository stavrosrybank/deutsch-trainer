import { useMemo } from 'react';

function getDateString(isoDate) {
  return new Date(isoDate).toLocaleDateString();
}

// quizSessions passed in from useVocab to avoid a duplicate async call
export function useProgress(sessions, vocab, quizSessions) {
  return useMemo(() => {
    const sessionCount = sessions.length;

    // Streak: consecutive calendar days ending today
    const daySet = new Set(sessions.map((s) => getDateString(s.date)));
    let streak = 0;
    let cursor = new Date();
    while (true) {
      const dateStr = cursor.toLocaleDateString();
      if (daySet.has(dateStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    // Category counts
    const categoryCounts = { articles: 0, structure: 0, vocabulary: 0, verbs: 0, other: 0 };
    sessions.forEach((s) => {
      (s.analysis?.corrections || []).forEach((c) => {
        const cat = c.category in categoryCounts ? c.category : 'other';
        categoryCounts[cat]++;
      });
    });

    // Vocab stats
    const vocabList = vocab || [];
    const vocabTotal = vocabList.length;
    const vocabByStatus = { learning: 0, review: 0, learned: 0 };
    vocabList.forEach((v) => {
      if (v.status in vocabByStatus) vocabByStatus[v.status]++;
    });

    const qs = quizSessions || [];
    const quizCount = qs.length;
    const totalCorrect = qs.reduce((sum, s) => sum + (s.correctAnswers || 0), 0);
    const totalAsked = qs.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
    const quizAccuracy = totalAsked > 0 ? Math.round((totalCorrect / totalAsked) * 100) : null;

    return { sessionCount, streak, categoryCounts, vocabTotal, vocabByStatus, quizCount, quizAccuracy };
  }, [sessions, vocab, quizSessions]);
}
