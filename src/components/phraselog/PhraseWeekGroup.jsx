import PhraseEntry from './PhraseEntry';

function formatWeekLabel(weekKey) {
  // weekKey format: "2026-W11"
  const [year, weekPart] = weekKey.split('-W');
  const weekNum = parseInt(weekPart, 10);

  // Compute the Monday of that ISO week
  const jan4 = new Date(parseInt(year, 10), 0, 4);
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (weekNum - 1) * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d) =>
    d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });

  return `KW ${weekNum} · ${fmt(monday)} – ${fmt(sunday)} ${year}`;
}

export default function PhraseWeekGroup({ weekKey, phrases, patternReport, onToggleLearned, onAddToVocab }) {
  return (
    <section className="week-group">
      <h2 className="week-heading">{formatWeekLabel(weekKey)}</h2>

      {patternReport && (
        <div className="pattern-report-card">
          <span className="pattern-report-icon">📊</span>
          <div>
            <p className="pattern-report-label">Musterbericht</p>
            <p className="pattern-report-text">{patternReport.report}</p>
          </div>
        </div>
      )}

      {phrases.map((p) => (
        <PhraseEntry key={p.id} phrase={p} onToggleLearned={onToggleLearned} onAddToVocab={onAddToVocab} />
      ))}
    </section>
  );
}
