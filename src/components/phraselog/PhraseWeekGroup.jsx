import PhraseEntry from './PhraseEntry';

function parseReport(raw) {
  try {
    const p = JSON.parse(raw);
    return { level: p.level || null, text: p.text || p.report || raw };
  } catch {
    return { level: null, text: raw };
  }
}

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

      {patternReport && (() => {
        const { level, text } = parseReport(patternReport.report);
        return (
          <div className="pattern-report-card">
            <span className="pattern-report-icon">📊</span>
            <div className="pattern-report-body">
              <div className="pattern-report-header">
                <p className="pattern-report-label">Musterbericht</p>
                {level && <span className="level-badge">{level}</span>}
              </div>
              <p className="pattern-report-text">{text}</p>
            </div>
          </div>
        );
      })()}

      {phrases.map((p) => (
        <PhraseEntry key={p.id} phrase={p} onToggleLearned={onToggleLearned} onAddToVocab={onAddToVocab} />
      ))}
    </section>
  );
}
