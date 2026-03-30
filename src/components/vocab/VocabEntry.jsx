export default function VocabEntry({ entry, onDelete }) {
  const statusLabels = { learning: 'Lernend', review: 'Wiederholen', learned: 'Gelernt' };
  const displayWord = entry.article ? `${entry.article} ${entry.german}` : entry.german;

  return (
    <div className={`vocab-entry vocab-entry--${entry.status}`}>
      <div className="vocab-entry-main">
        <span className="vocab-german">{displayWord}</span>
        {entry.plural && <span className="vocab-plural"> · {entry.plural}</span>}
        <span className="vocab-english">{entry.english}</span>
      </div>
      <div className="vocab-entry-meta">
        <span className={`vocab-status-badge vocab-status--${entry.status}`}>
          {statusLabels[entry.status]}
        </span>
        <span className="vocab-difficulty-badge">{entry.difficulty}</span>
        <span className="vocab-streak" title="Richtige Antworten in Folge">
          {'●'.repeat(Math.min(entry.correctStreak, 5))}{'○'.repeat(Math.max(0, 5 - entry.correctStreak))}
        </span>
        {onDelete && (
          <button
            className="vocab-delete-btn"
            onClick={() => onDelete(entry.id)}
            title="Löschen"
            aria-label={`${entry.german} löschen`}
          >
            ×
          </button>
        )}
      </div>
      {entry.example && (
        <p className="vocab-example">{entry.example}</p>
      )}
    </div>
  );
}
