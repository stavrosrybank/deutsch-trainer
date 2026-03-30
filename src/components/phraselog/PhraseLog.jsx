import { useState, useEffect, useCallback } from 'react';
import PhraseWeekGroup from './PhraseWeekGroup';
import { getPhrases, getPatternReports, updatePhrase } from '../../services/storage';

export default function PhraseLog({ onAddToVocab }) {
  const [phrases, setPhrases] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPhrases(), getPatternReports()])
      .then(([p, r]) => { setPhrases(p); setReports(r); })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleLearned = useCallback(async (id) => {
    const updated = phrases.map((p) =>
      p.id === id ? { ...p, learned: !p.learned } : p
    );
    setPhrases(updated);
    const phrase = updated.find((p) => p.id === id);
    await updatePhrase(id, { learned: phrase.learned });
  }, [phrases]);

  if (loading) {
    return <div className="empty-state"><p>Wird geladen…</p></div>;
  }

  if (!phrases.length) {
    return (
      <div className="empty-state">
        <p>Noch keine Phrasen gespeichert — absolviere deine erste Übung!</p>
      </div>
    );
  }

  const byWeek = phrases.reduce((acc, p) => {
    if (!acc[p.week]) acc[p.week] = [];
    acc[p.week].push(p);
    return acc;
  }, {});

  const sortedWeeks = Object.keys(byWeek).sort((a, b) => b.localeCompare(a));

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
          onAddToVocab={onAddToVocab}
        />
      ))}
    </div>
  );
}
