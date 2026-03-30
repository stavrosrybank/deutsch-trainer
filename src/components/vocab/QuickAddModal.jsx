import { useState } from 'react';
import { quickAddLookup } from '../../services/claude';

export default function QuickAddModal({ onSave, onClose, isDuplicate }) {
  const [word, setWord] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await quickAddLookup(word.trim());
      setPreview({ german: word.trim(), ...result });
    } catch (err) {
      setError(`Fehler beim Nachschlagen: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;
    onSave(preview);
    onClose();
  };

  const dupWarning = preview && isDuplicate(preview.german);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Schnell hinzufügen</h2>
          <button className="modal-close" onClick={onClose} aria-label="Schließen">×</button>
        </div>

        {!preview ? (
          <form onSubmit={handleLookup} className="modal-form">
            <p className="modal-body">Gib ein deutsches Wort oder eine Phrase ein. Claude schlägt automatisch Übersetzung, Artikel und Beispielsatz nach.</p>
            <label className="form-label">Deutsches Wort / Phrase</label>
            <input
              className="form-input"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="z.B. Fernweh"
              autoFocus
              disabled={loading}
            />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={!word.trim() || loading}>
              {loading ? 'Wird nachgeschlagen…' : 'Nachschlagen'}
            </button>
          </form>
        ) : (
          <div className="quick-add-preview">
            {dupWarning && (
              <div className="quick-add-warning">
                Dieses Wort ist bereits in deiner Vokabelliste.
              </div>
            )}
            <div className="quick-add-field">
              <span className="quick-add-label">Deutsch</span>
              <span className="quick-add-value">
                {preview.article ? `${preview.article} ` : ''}<strong>{preview.german}</strong>
                {preview.plural ? ` · ${preview.plural}` : ''}
              </span>
            </div>
            <div className="quick-add-field">
              <span className="quick-add-label">Englisch</span>
              <span className="quick-add-value">{preview.english}</span>
            </div>
            <div className="quick-add-field">
              <span className="quick-add-label">Beispiel</span>
              <span className="quick-add-value quick-add-example">{preview.example}</span>
            </div>
            <div className="quick-add-field">
              <span className="quick-add-label">Stufe</span>
              <span className="quick-add-value">{preview.difficulty}</span>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSave}>Speichern</button>
              <button className="btn-secondary" onClick={() => setPreview(null)}>Zurück</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
