import { useState } from 'react';

const EMPTY = { german: '', english: '', article: '', plural: '', example: '', difficulty: 'B1' };

export default function AddWordForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.german.trim() || !form.english.trim()) {
      setError('Deutsches Wort und Übersetzung sind Pflichtfelder.');
      return;
    }
    onAdd({
      german: form.german.trim(),
      english: form.english.trim(),
      article: form.article || null,
      plural: form.plural.trim() || null,
      example: form.example.trim(),
      difficulty: form.difficulty,
    });
    setForm(EMPTY);
    setError('');
  };

  return (
    <form className="add-word-form" onSubmit={handleSubmit}>
      <h3 className="section-label">Wort hinzufügen</h3>

      <div className="add-word-row">
        <div className="form-field">
          <label className="form-label">Deutsch *</label>
          <input className="form-input" value={form.german} onChange={set('german')} placeholder="z.B. Heimweh" />
        </div>
        <div className="form-field form-field--narrow">
          <label className="form-label">Artikel</label>
          <select className="form-input" value={form.article} onChange={set('article')}>
            <option value="">—</option>
            <option value="der">der</option>
            <option value="die">die</option>
            <option value="das">das</option>
          </select>
        </div>
      </div>

      <div className="add-word-row">
        <div className="form-field">
          <label className="form-label">Englisch *</label>
          <input className="form-input" value={form.english} onChange={set('english')} placeholder="z.B. homesickness" />
        </div>
        <div className="form-field">
          <label className="form-label">Plural</label>
          <input className="form-input" value={form.plural} onChange={set('plural')} placeholder="z.B. die Heimwehe" />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Beispielsatz</label>
        <input className="form-input" value={form.example} onChange={set('example')} placeholder="z.B. Ich habe Heimweh nach Berlin." />
      </div>

      <div className="form-field form-field--narrow">
        <label className="form-label">Schwierigkeit</label>
        <select className="form-input" value={form.difficulty} onChange={set('difficulty')}>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-primary">Hinzufügen</button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>Abbrechen</button>
        )}
      </div>
    </form>
  );
}
