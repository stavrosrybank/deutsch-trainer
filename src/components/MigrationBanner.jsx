import { useState } from 'react';
import { hasLocalStorageData, migrateLocalStorageToSupabase } from '../services/migration';

export default function MigrationBanner({ onDone }) {
  const [state, setState] = useState('idle'); // idle | migrating | done | error
  const [counts, setCounts] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  if (!hasLocalStorageData() || dismissed) return null;

  const handleMigrate = async () => {
    setState('migrating');
    try {
      const result = await migrateLocalStorageToSupabase();
      setCounts(result);
      setState('done');
      setTimeout(() => {
        setDismissed(true);
        onDone?.();
      }, 3000);
    } catch (err) {
      console.error('Migration failed:', err);
      setState('error');
    }
  };

  return (
    <div className="migration-banner">
      {state === 'idle' && (
        <>
          <p className="migration-text">
            Du hast Daten aus der alten Version — möchtest du sie in die Cloud migrieren?
          </p>
          <div className="migration-actions">
            <button className="btn-primary" onClick={handleMigrate}>
              Jetzt migrieren
            </button>
            <button className="btn-ghost" onClick={() => setDismissed(true)}>
              Später
            </button>
          </div>
        </>
      )}
      {state === 'migrating' && (
        <p className="migration-text">
          <span className="migration-spinner" /> Daten werden übertragen…
        </p>
      )}
      {state === 'done' && counts && (
        <p className="migration-text migration-text--success">
          ✓ Migration abgeschlossen — {counts.sessions} Übungen, {counts.vocab} Vokabeln übertragen
        </p>
      )}
      {state === 'error' && (
        <p className="migration-text migration-text--error">
          Migration fehlgeschlagen. Bitte versuche es erneut oder kontaktiere den Support.
        </p>
      )}
    </div>
  );
}
