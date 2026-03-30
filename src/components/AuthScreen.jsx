import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');
      setLoading(false);
    }
    // On success, App.jsx auth listener updates session state automatically
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Willkommen bei Deutsch Trainer</h2>
        <p className="modal-body">Bitte melde dich an, um fortzufahren.</p>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label" htmlFor="auth-email">E-Mail</label>
          <input
            id="auth-email"
            type="email"
            className="form-input"
            placeholder="deine@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            autoComplete="email"
            disabled={loading}
          />
          <label className="form-label" htmlFor="auth-password">Passwort</label>
          <input
            id="auth-password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            autoComplete="current-password"
            disabled={loading}
          />
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn-primary"
            disabled={!email.trim() || !password.trim() || loading}
          >
            {loading ? 'Wird angemeldet…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}
