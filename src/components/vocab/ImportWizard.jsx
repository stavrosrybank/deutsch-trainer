import { useState } from 'react';
import { importCleanBatch } from '../../services/claude';

const BATCH_SIZE = 20;
const ARTICLES = ['der ', 'die ', 'das '];

function stripLeadingArticle(german) {
  const lower = (german || '').toLowerCase();
  for (const art of ARTICLES) {
    if (lower.startsWith(art)) return german.slice(art.length);
  }
  return german;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function ImportWizard({ onImport, onClose, isDuplicate }) {
  const [step, setStep] = useState('paste'); // paste | processing | preview | done
  const [rawText, setRawText] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      setError('Bitte füge mindestens ein Wort ein.');
      return;
    }

    const batches = chunkArray(lines, BATCH_SIZE);
    setProgress({ current: 0, total: batches.length });
    setStep('processing');
    setError('');

    const allResults = [];
    const seen = new Set();

    for (let i = 0; i < batches.length; i++) {
      setProgress({ current: i + 1, total: batches.length });
      try {
        const cleaned = await importCleanBatch(batches[i]);
        for (const entry of cleaned) {
          const norm = (entry.german || '').toLowerCase().trim();
          const cleanGerman = stripLeadingArticle(entry.german);
          const cleanNorm = cleanGerman.toLowerCase().trim();
          if (cleanNorm && !seen.has(cleanNorm)) {
            seen.add(cleanNorm);
            allResults.push({
              ...entry,
              german: cleanGerman,
              isDupe: isDuplicate(cleanGerman),
            });
          }
        }
      } catch (err) {
        setError(`Fehler bei Batch ${i + 1}: ${err.message}`);
        setStep('paste');
        return;
      }
    }

    setPreview(allResults);
    setStep('preview');
  };

  const handleConfirm = () => {
    const toImport = preview.filter((e) => !e.isDupe);
    const count = onImport(toImport);
    setStep('done');
    // eslint-disable-next-line no-unused-vars
    void count;
  };

  const newCount = preview.filter((e) => !e.isDupe).length;
  const dupeCount = preview.filter((e) => e.isDupe).length;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal-header">
          <h2>Vokabeln importieren</h2>
          <button className="modal-close" onClick={onClose} aria-label="Schließen">×</button>
        </div>

        {step === 'paste' && (
          <div className="modal-form">
            <p className="modal-body">
              Füge deine Wortliste aus einem Google Doc oder einer anderen Quelle ein — ein Wort oder eine Phrase pro Zeile. Claude bereinigt, übersetzt und ergänzt automatisch.
            </p>
            <label className="form-label">Wortliste einfügen</label>
            <textarea
              className="form-input import-textarea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={"Heimweh\nFernweh\nWeltschmerz\nZeigeist\n…"}
              rows={10}
            />
            {error && <p className="form-error">{error}</p>}
            <div className="form-actions">
              <button
                className="btn-primary"
                onClick={handleProcess}
                disabled={!rawText.trim()}
              >
                Verarbeiten
              </button>
              <button className="btn-secondary" onClick={onClose}>Abbrechen</button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="import-processing">
            <div className="import-spinner" />
            <p>Batch {progress.current} von {progress.total} wird verarbeitet…</p>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="import-preview">
            <p className="import-summary">
              <strong>{newCount}</strong> neue Wörter werden importiert
              {dupeCount > 0 && ` · ${dupeCount} bereits vorhanden (übersprungen)`}.
            </p>
            <div className="import-preview-list">
              {preview.map((entry, i) => (
                <div
                  key={i}
                  className={`import-preview-entry ${entry.isDupe ? 'import-preview-entry--dupe' : ''}`}
                >
                  <span className="import-german">
                    {entry.article ? `${entry.article} ` : ''}{entry.german}
                  </span>
                  <span className="import-english">{entry.english}</span>
                  <span className="import-difficulty">{entry.difficulty}</span>
                  {entry.isDupe && <span className="import-dupe-label">vorhanden</span>}
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleConfirm} disabled={newCount === 0}>
                {newCount} Wörter importieren
              </button>
              <button className="btn-secondary" onClick={() => setStep('paste')}>Zurück</button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="import-done">
            <p className="import-done-msg">{newCount} Wörter erfolgreich importiert!</p>
            <button className="btn-primary" onClick={onClose}>Fertig</button>
          </div>
        )}
      </div>
    </div>
  );
}
