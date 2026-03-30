export default function PhraseEntry({ phrase, onToggleLearned, onAddToVocab }) {
  const CATEGORY_LABELS = {
    articles: 'Artikel',
    structure: 'Satzstruktur',
    vocabulary: 'Wortschatz',
    verbs: 'Verben',
    other: 'Sonstiges',
  };

  const date = new Date(phrase.date).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className={`phrase-entry ${phrase.learned ? 'learned' : ''}`}>
      <div className="phrase-meta">
        <span className="phrase-date">{date}</span>
        <span className="phrase-topic-chip">{phrase.topic}</span>
        <span className="phrase-category-chip">
          {CATEGORY_LABELS[phrase.category] || phrase.category}
        </span>
      </div>
      <div className="phrase-pair">
        <span className="phrase-wrong">❌ {phrase.original}</span>
        <span className="phrase-arrow">→</span>
        <span className="phrase-right">✅ {phrase.improved}</span>
      </div>
      <p className="phrase-explanation">{phrase.explanation}</p>
      <div className="phrase-actions">
        <button
          className={`btn-learned ${phrase.learned ? 'is-learned' : ''}`}
          onClick={() => onToggleLearned(phrase.id)}
        >
          {phrase.learned ? '✓ Gelernt' : 'Als gelernt markieren'}
        </button>
        {onAddToVocab && (
          <button
            className="btn-add-vocab"
            onClick={() => onAddToVocab({
              german: phrase.improved,
              english: '',
              example: phrase.improved,
              difficulty: 'B1',
            })}
            title="Zu Vokabeln hinzufügen"
          >
            + Vokabel
          </button>
        )}
      </div>
    </div>
  );
}
