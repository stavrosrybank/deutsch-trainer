import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import NavBar from './components/NavBar';
import AuthScreen from './components/AuthScreen';
import MigrationBanner from './components/MigrationBanner';
import Practice from './components/practice/Practice';
import PhraseLog from './components/phraselog/PhraseLog';
import Progress from './components/progress/Progress';
import Vocab from './components/vocab/Vocab';
import QuickAddButton from './components/QuickAddButton';
import { exportAllData, importAllData } from './services/storage';
import { useSessions } from './hooks/useSessions';
import { useVocab } from './hooks/useVocab';
import { useProgress } from './hooks/useProgress';

function getInitialTab() {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  if (isPWA) return 'vocab';
  return sessionStorage.getItem('dt_last_tab') || 'practice';
}

function AppShell() {
  const [tab, setTab] = useState(getInitialTab);

  const { sessions } = useSessions();
  const {
    vocab,
    quizSessions,
    addWord,
    updateWord,
    deleteWord,
    addManyWords,
    getQuizWords,
    recordQuizSession,
    isDuplicate,
    refresh: refreshVocab,
  } = useVocab();

  const { sessionCount } = useProgress(sessions, vocab, quizSessions);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    sessionStorage.setItem('dt_last_tab', newTab);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const ok = await importAllData(ev.target.result);
      if (ok) window.location.reload();
      else alert('Import fehlgeschlagen — ungültige Datei.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="app-shell">
      <MigrationBanner onDone={refreshVocab} />
      <NavBar activeTab={tab} onTabChange={handleTabChange} sessionCount={sessionCount} />
      <main className="main-content">
        {tab === 'practice' && <Practice />}
        {tab === 'phraselog' && <PhraseLog onAddToVocab={addWord} />}
        {tab === 'vocab' && (
          <Vocab
            vocab={vocab}
            onAddWord={addWord}
            onUpdateWord={updateWord}
            onDeleteWord={deleteWord}
            onAddManyWords={addManyWords}
            getQuizWords={getQuizWords}
            onSessionEnd={recordQuizSession}
            isDuplicate={isDuplicate}
          />
        )}
        {tab === 'progress' && (
          <Progress sessions={sessions} vocab={vocab} quizSessions={quizSessions} />
        )}
      </main>

      <div className="app-footer-actions">
        <QuickAddButton onSave={addWord} isDuplicate={isDuplicate} />
        <div className="data-actions">
          <button className="btn-ghost data-btn" onClick={exportAllData}>
            Exportieren
          </button>
          <label className="btn-ghost data-btn" style={{ cursor: 'pointer' }}>
            Importieren
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  );
}

function App() {
  // undefined = still checking session, null = no session, object = logged in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="app-loading"><div className="app-loading-spinner" /></div>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <AppShell />;
}

export default App;
