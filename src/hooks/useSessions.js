import { useState, useEffect, useCallback } from 'react';
import { getSessions, saveSession } from '../services/storage';

export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getSessions();
    setSessions(data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addSession = useCallback(async (session) => {
    await saveSession(session);
    setSessions(await getSessions());
  }, []);

  return { sessions, loading, addSession };
}
