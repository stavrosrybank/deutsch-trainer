export default function WritingArea({ value, onChange, onSubmit, loading }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="writing-area">
      <textarea
        className="writing-textarea"
        placeholder="Schreib hier auf Deutsch…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        disabled={loading}
      />
      <div className="writing-footer">
        <span className="word-count">{wordCount} {wordCount === 1 ? 'Wort' : 'Wörter'}</span>
        <button
          className="btn-primary"
          onClick={onSubmit}
          disabled={!value.trim() || loading}
        >
          {loading ? 'Wird analysiert…' : 'Analyse starten'}
        </button>
      </div>
    </div>
  );
}
