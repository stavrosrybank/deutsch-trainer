const CATEGORY_LABELS = {
  articles: 'Artikel',
  structure: 'Satzstruktur',
  vocabulary: 'Wortschatz',
  verbs: 'Verben',
  other: 'Sonstiges',
};

function CorrectionCard({ correction }) {
  return (
    <div className="correction-card">
      <div className="correction-pair">
        <span className="correction-wrong">❌ {correction.original}</span>
        <span className="correction-arrow">→</span>
        <span className="correction-right">✅ {correction.improved}</span>
      </div>
      <p className="correction-explanation">{correction.explanation}</p>
      <span className="correction-category-chip">
        {CATEGORY_LABELS[correction.category] || correction.category}
      </span>
    </div>
  );
}

export default function AnalysisResult({ analysis, onNewSession }) {
  if (!analysis) return null;

  return (
    <div className="analysis-result">
      <div className="analysis-summary">
        <p>{analysis.summary}</p>
      </div>

      {analysis.corrections.length > 0 && (
        <div className="corrections-section">
          <h3 className="section-label">Korrekturen</h3>
          {analysis.corrections.map((c, i) => (
            <CorrectionCard key={i} correction={c} />
          ))}
        </div>
      )}

      {analysis.patternObservation && (
        <div className="pattern-observation">
          <span className="pattern-icon">💡</span>
          <p>{analysis.patternObservation}</p>
        </div>
      )}

      <button className="btn-secondary" onClick={onNewSession}>
        Neue Übung starten
      </button>
    </div>
  );
}
