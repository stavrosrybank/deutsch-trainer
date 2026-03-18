const LABELS = {
  articles: 'Artikel',
  structure: 'Satzstruktur',
  vocabulary: 'Wortschatz',
  verbs: 'Verben',
  other: 'Sonstiges',
};

export default function CategoryBreakdown({ categoryCounts }) {
  const entries = Object.entries(categoryCounts);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="category-breakdown">
      <h3 className="section-label">Häufigste Korrekturen</h3>
      {entries.map(([cat, count]) => (
        <div key={cat} className="cat-row">
          <span className="cat-label">{LABELS[cat] || cat}</span>
          <div className="cat-bar-track">
            <div
              className="cat-bar-fill"
              style={{ width: `${Math.round((count / max) * 100)}%` }}
            />
          </div>
          <span className="cat-count">{count}</span>
        </div>
      ))}
    </div>
  );
}
