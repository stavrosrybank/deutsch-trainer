import VocabEntry from './VocabEntry';

export default function VocabList({ vocab, filterStatus, filterDifficulty, onDelete }) {
  const filtered = vocab.filter((v) => {
    if (filterStatus && filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (filterDifficulty && filterDifficulty !== 'all' && v.difficulty !== filterDifficulty) return false;
    return true;
  });

  if (!filtered.length) {
    return (
      <div className="empty-state">
        {vocab.length === 0
          ? 'Noch keine Vokabeln — füge dein erstes Wort hinzu!'
          : 'Keine Einträge mit diesem Filter.'}
      </div>
    );
  }

  return (
    <div className="vocab-list">
      {filtered.map((entry) => (
        <VocabEntry key={entry.id} entry={entry} onDelete={onDelete} />
      ))}
    </div>
  );
}
