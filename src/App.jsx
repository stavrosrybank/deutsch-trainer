import { useState } from 'react';
import NavBar from './components/NavBar';
import ApiKeyModal from './components/ApiKeyModal';
import Practice from './components/practice/Practice';
import PhraseLog from './components/phraselog/PhraseLog';
import Progress from './components/progress/Progress';
import { getSettings } from './services/storage';
import { useSessions } from './hooks/useSessions';

function App() {
  const [tab, setTab] = useState('practice');
  const [apiKey, setApiKey] = useState(() => getSettings().apiKey || '');
  const { sessions } = useSessions();

  return (
    <>
      {!apiKey && <ApiKeyModal onSave={setApiKey} />}
      <div className="app-shell">
        <NavBar activeTab={tab} onTabChange={setTab} sessionCount={sessions.length} />
        <main className="main-content">
          {tab === 'practice' && <Practice apiKey={apiKey} />}
          {tab === 'phraselog' && <PhraseLog />}
          {tab === 'progress' && <Progress sessions={sessions} />}
        </main>
      </div>
    </>
  );
}

export default App;
