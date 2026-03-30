import { useState } from 'react';
import VocabList from './VocabList';
import AddWordForm from './AddWordForm';
import ImportWizard from './ImportWizard';
import QuizMode from './QuizMode';
import QuickAddModal from './QuickAddModal';

export default function Vocab({ vocab, onAddWord, onUpdateWord, onDeleteWord, onAddManyWords, getQuizWords, onSessionEnd, isDuplicate }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quizWords, setQuizWords] = useState(null); // null = not in quiz

  const statusCounts = vocab.reduce(
    (acc, v) => { acc[v.status] = (acc[v.status] || 0) + 1; return acc; },
    {}
  );

  const handleStartQuiz = () => {
    const words = getQuizWords(10);
    if (!words.length) return;
    setQuizWords(words);
  };

  const handleQuizAnswer = (wordId, newStreak) => {
    onUpdateWord(wordId, {
      correctStreak: newStreak,
      lastSeen: new Date().toISOString(),
    });
  };

  if (quizWords) {
    return (
      <QuizMode
        words={quizWords}
        onAnswer={handleQuizAnswer}
        onClose={() => setQuizWords(null)}
        onSessionEnd={(total, correct, ids) => {
          onSessionEnd(total, correct, ids);
          setQuizWords(null);
        }}
      />
    );
  }

  return (
    <div className="vocab-container">
      <div className="vocab-header">
        <h1 className="page-title">Meine Vokabeln</h1>
        <div className="vocab-header-actions">
          <button className="btn-primary" onClick={handleStartQuiz} disabled={!vocab.length}>
            Quiz starten
          </button>
          <button className="btn-secondary" onClick={() => setShowQuickAdd(true)}>
            + Schnell hinzufügen
          </button>
          <button className="btn-secondary" onClick={() => setShowImport(true)}>
            Importieren
          </button>
        </div>
      </div>

      <div className="vocab-stats-strip">
        <span className="vocab-stat">
          <strong>{vocab.length}</strong> Wörter
        </span>
        <span className="vocab-stat vocab-stat--learning">
          <strong>{statusCounts.learning || 0}</strong> Lernend
        </span>
        <span className="vocab-stat vocab-stat--review">
          <strong>{statusCounts.review || 0}</strong> Wiederholen
        </span>
        <span className="vocab-stat vocab-stat--learned">
          <strong>{statusCounts.learned || 0}</strong> Gelernt
        </span>
      </div>

      <div className="vocab-filters">
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select className="form-input form-input--sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Alle</option>
            <option value="learning">Lernend</option>
            <option value="review">Wiederholen</option>
            <option value="learned">Gelernt</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Stufe</label>
          <select className="form-input form-input--sm" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="all">Alle</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
        </div>
        <button
          className="btn-ghost"
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? 'Formular schließen' : '+ Manuell hinzufügen'}
        </button>
      </div>

      {showAddForm && (
        <AddWordForm
          onAdd={(fields) => {
            onAddWord(fields);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <VocabList
        vocab={vocab}
        filterStatus={filterStatus}
        filterDifficulty={filterDifficulty}
        onDelete={onDeleteWord}
      />

      {showImport && (
        <ImportWizard
          onImport={(entries) => onAddManyWords(entries)}
          onClose={() => setShowImport(false)}
          isDuplicate={isDuplicate}
        />
      )}

      {showQuickAdd && (
        <QuickAddModal
          onSave={(fields) => onAddWord(fields)}
          onClose={() => setShowQuickAdd(false)}
          isDuplicate={isDuplicate}
        />
      )}
    </div>
  );
}
