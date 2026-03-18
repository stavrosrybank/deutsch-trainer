import { useMemo } from 'react';
import { getSessions } from '../services/storage';

function getDateString(isoDate) {
  return new Date(isoDate).toLocaleDateString();
}

export function useProgress(sessions) {
  return useMemo(() => {
    const sessionCount = sessions.length;

    // Streak: consecutive calendar days ending today
    const today = getDateString(new Date().toISOString());
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

    return { sessionCount, streak, categoryCounts };
  }, [sessions]);
}
