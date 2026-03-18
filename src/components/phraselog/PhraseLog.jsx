import { useState, useCallback } from 'react';
import PhraseWeekGroup from './PhraseWeekGroup';
import { getPhrases, getPatternReports, updatePhrase } from '../../services/storage';

export default function PhraseLog() {
  const [phrases, setPhrases] = useState(() => getPhrases());
  const [reports] = useState(() => getPatternReports());

  const handleToggleLearned = useCallback((id) => {
    const updated = phrases.map((p) =>
      p.id === id ? { ...p, learned: !p.learned } : p
    );
    setPhrases(updated);
    const phrase = updated.find((p) => p.id === id);
    updatePhrase(id, { learned: phrase.learned });
  }, [phrases]);

  if (!phrases.length) {
    return (
      <div className="empty-state">
        <p>Noch keine Phrasen gespeichert — absolviere deine erste Übung!</p>
      </div>
    );
  }

  // Group phrases by week descending
  const byWeek = phrases.reduce((acc, p) => {
    if (!acc[p.week]) acc[p.week] = [];
    acc[p.week].push(p);
    return acc;
  }, {});

  const sortedWeeks = Object.keys(byWeek).sort((a, b) => b.localeCompare(a));

  // Map pattern reports by week
  const reportByWeek = reports.reduce((acc, r) => {
    acc[r.week] = r;
    return acc;
  }, {});

  return (
    <div className="phraselog-container">
      <h1 className="page-title">Mein Phrasenbuch</h1>
      {sortedWeeks.map((week) => (
        <PhraseWeekGroup
          key={week}
          weekKey={week}
          phrases={byWeek[week]}
          patternReport={reportByWeek[week] || null}
          onToggleLearned={handleToggleLearned}
        />
      ))}
    </div>
  );
}
