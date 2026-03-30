export default function VocabStats({ vocabTotal, vocabByStatus, quizCount, quizAccuracy }) {
  const statusRows = [
    { key: 'learning', label: 'Lernend', cls: 'vocab-status--learning' },
    { key: 'review', label: 'Wiederholen', cls: 'vocab-status--review' },
    { key: 'learned', label: 'Gelernt', cls: 'vocab-status--learned' },
  ];

  return (
    <div className="vocab-stats-card">
      <h3 className="section-label">Vokabeln</h3>
      <div className="vocab-stats-grid">
        <div className="vocab-stat-block">
          <span className="vocab-stat-number">{vocabTotal}</span>
          <span className="vocab-stat-label">Wörter gesamt</span>
        </div>
        <div className="vocab-stat-block">
          <span className="vocab-stat-number">{quizCount}</span>
          <span className="vocab-stat-label">Quiz-Sessions</span>
        </div>
        {quizAccuracy !== null && (
          <div className="vocab-stat-block">
            <span className="vocab-stat-number">{quizAccuracy}%</span>
            <span className="vocab-stat-label">Genauigkeit</span>
          </div>
        )}
      </div>
      {vocabTotal > 0 && (
        <div className="vocab-status-breakdown">
          {statusRows.map(({ key, label, cls }) => (
            <div key={key} className="vocab-status-row">
              <span className={`vocab-status-badge ${cls}`}>{label}</span>
              <div className="cat-bar-track">
                <div
                  className="cat-bar-fill"
                  style={{ width: `${Math.round(((vocabByStatus[key] || 0) / vocabTotal) * 100)}%` }}
                />
              </div>
              <span className="cat-count">{vocabByStatus[key] || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
