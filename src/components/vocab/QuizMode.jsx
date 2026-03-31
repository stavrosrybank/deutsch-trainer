import { useState, useEffect, useCallback } from 'react';
import { generateQuizQuestion } from '../../services/claude';
import QuizQuestion from './QuizQuestion';
import QuizSummary from './QuizSummary';

const QUESTION_TYPES = ['translation', 'article', 'fillblank', 'plural'];
const SESSION_LENGTH = 10;

function pickQuestionType(entry) {
  const available = ['translation', 'fillblank'];
  if (entry.article) available.push('article', 'plural');
  return available[Math.floor(Math.random() * available.length)];
}

export default function QuizMode({ words, onAnswer, onClose, onSessionEnd }) {
  const [index, setIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]); // [{wordId, correct}]
  const [done, setDone] = useState(false);

  const loadQuestion = useCallback(async (idx) => {
    if (idx >= Math.min(SESSION_LENGTH, words.length)) {
      setDone(true);
      return;
    }
    setLoading(true);
    setError('');
    const word = words[idx];
    const qType = pickQuestionType(word);
    try {
      const q = await generateQuizQuestion(word, qType);
      setCurrentQuestion({ ...q, wordId: word.id, qType, english: word.english });
    } catch (err) {
      setError(`Fehler beim Laden der Frage: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [words]);

  useEffect(() => {
    loadQuestion(0);
  }, [loadQuestion]);

  const handleAnswer = (correct) => {
    const word = words[index];
    const newStreak = correct ? word.correctStreak + 1 : 0;
    onAnswer(word.id, newStreak);

    const newResults = [...results, { wordId: word.id, correct }];
    setResults(newResults);

    const nextIdx = index + 1;
    setIndex(nextIdx);

    if (nextIdx >= Math.min(SESSION_LENGTH, words.length)) {
      const correctCount = newResults.filter((r) => r.correct).length;
      onSessionEnd(newResults.length, correctCount, newResults.map((r) => r.wordId));
      setDone(true);
    } else {
      loadQuestion(nextIdx);
    }
  };

  if (done) {
    const correctCount = results.filter((r) => r.correct).length;
    return (
      <QuizSummary
        totalQuestions={results.length}
        correctAnswers={correctCount}
        onClose={onClose}
      />
    );
  }

  const total = Math.min(SESSION_LENGTH, words.length);

  return (
    <div className="quiz-mode">
      <div className="quiz-header">
        <span className="quiz-progress">{index + 1} / {total}</span>
        <button className="btn-ghost" onClick={onClose}>Abbrechen</button>
      </div>
      <div className="quiz-progress-bar-track">
        <div
          className="quiz-progress-bar-fill"
          style={{ width: `${Math.round((index / total) * 100)}%` }}
        />
      </div>

      {loading && (
        <div className="quiz-loading">
          <div className="import-spinner" />
          <p>Frage wird geladen…</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && currentQuestion && (
        <QuizQuestion question={currentQuestion} onAnswer={handleAnswer} />
      )}
    </div>
  );
}
