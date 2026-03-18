import { useState } from 'react';
import { saveSettings } from '../services/storage';

export default function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError('API key should start with sk-ant-');
      return;
    }
    saveSettings({ apiKey: trimmed });
    onSave(trimmed);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Willkommen bei Deutsch Trainer</h2>
        <p className="modal-body">
          Um dein Schreiben zu analysieren, benötigst du einen Anthropic API-Schlüssel.
          Du findest ihn auf{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
            console.anthropic.com
          </a>
          . Er wird nur in deinem Browser gespeichert.
        </p>
        <form onSubmit={handleSubmit} className="modal-form">
          <label htmlFor="api-key-input" className="form-label">
            API Key
          </label>
          <input
            id="api-key-input"
            type="password"
            className="form-input"
            placeholder="sk-ant-..."
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError('');
            }}
            autoComplete="off"
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={!key.trim()}>
            Speichern &amp; loslegen
          </button>
        </form>
      </div>
    </div>
  );
}
