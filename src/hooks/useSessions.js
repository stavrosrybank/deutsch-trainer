import { useState, useEffect, useCallback } from 'react';
import { getSessions, saveSession } from '../services/storage';

export function useSessions() {
  const [sessions, setSessions] = useState(() => getSessions());

  const refresh = useCallback(() => setSessions(getSessions()), []);

  useEffect(() => {
    window.addEventListener('dt:session-saved', refresh);
    return () => window.removeEventListener('dt:session-saved', refresh);
  }, [refresh]);

  const addSession = useCallback((session) => {
    saveSession(session);
    setSessions(getSessions());
    window.dispatchEvent(new Event('dt:session-saved'));
  }, []);

  return { sessions, addSession };
}
