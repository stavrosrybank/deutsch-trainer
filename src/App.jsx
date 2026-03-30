import { useState } from 'react';
import NavBar from './components/NavBar';
import ApiKeyModal from './components/ApiKeyModal';
import Practice from './components/practice/Practice';
import PhraseLog from './components/phraselog/PhraseLog';
import Progress from './components/progress/Progress';
import Vocab from './components/vocab/Vocab';
import QuickAddButton from './components/QuickAddButton';
import { getSettings, exportAllData, importAllData } from './services/storage';
import { useSessions } from './hooks/useSessions';
import { useVocab } from './hooks/useVocab';

function App() {
  const [tab, setTab] = useState('practice');
  const [apiKey, setApiKey] = useState(() => getSettings().apiKey || '');
  const { sessions } = useSessions();
  const {
    vocab,
    addWord,
    updateWord,
    deleteWord,
    addManyWords,
    getQuizWords,
    recordQuizSession,
    isDuplicate,
  } = useVocab();

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importAllData(ev.target.result);
      if (ok) window.location.reload();
      else alert('Import fehlgeschlagen — ungültige Datei.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      {!apiKey && <ApiKeyModal onSave={setApiKey} />}
      <div className="app-shell">
        <NavBar activeTab={tab} onTabChange={setTab} sessionCount={sessions.length} />
        <main className="main-content">
          {tab === 'practice' && <Practice apiKey={apiKey} />}
          {tab === 'phraselog' && <PhraseLog onAddToVocab={addWord} />}
          {tab === 'vocab' && (
            <Vocab
              apiKey={apiKey}
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
          {tab === 'progress' && <Progress sessions={sessions} vocab={vocab} />}
        </main>

        <div className="app-footer-actions">
          <QuickAddButton apiKey={apiKey} onSave={addWord} isDuplicate={isDuplicate} />
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
    </>
  );
}

export default App;
