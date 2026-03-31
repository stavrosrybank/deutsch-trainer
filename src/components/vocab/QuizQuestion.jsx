import { useState } from 'react';
import { checkQuizAnswer } from '../../services/claude';

export default function QuizQuestion({ question, onAnswer }) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || submitted || checking) return;

    const exactMatch = input.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    if (exactMatch) {
      setCorrect(true);
      setFeedback(question.explanation);
      setSubmitted(true);
      return;
    }

    // Not an exact match — ask Haiku to check leniently
    setChecking(true);
    try {
      const result = await checkQuizAnswer(input.trim(), question.correctAnswer, question.qType);
      setCorrect(result.correct);
      setFeedback(result.feedback || question.explanation);
    } catch {
      // If the check itself fails, fall back to marking wrong
      setCorrect(false);
      setFeedback(question.explanation);
    } finally {
      setChecking(false);
      setSubmitted(true);
    }
  };

  const handleNext = () => {
    onAnswer(correct);
    setInput('');
    setSubmitted(false);
    setChecking(false);
    setCorrect(false);
    setFeedback('');
  };

  return (
    <div className="quiz-question">
      <p className="quiz-q-text">{question.question}</p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="quiz-answer-form">
          <input
            className="form-input quiz-answer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Deine Antwort…"
            autoFocus
            disabled={checking}
          />
          {checking ? (
            <div className="quiz-checking">
              <div className="import-spinner" />
              <span>Antwort wird geprüft…</span>
            </div>
          ) : (
            <button type="submit" className="btn-primary" disabled={!input.trim()}>
              Antworten
            </button>
          )}
        </form>
      ) : (
        <div className={`quiz-result ${correct ? 'quiz-result--correct' : 'quiz-result--wrong'}`}>
          <p className="quiz-result-verdict">
            {correct ? '✅ Richtig!' : `❌ Falsch — richtige Antwort: ${question.correctAnswer}`}
          </p>
          <p className="quiz-result-explanation">{feedback}</p>
          <button className="btn-primary" onClick={handleNext}>
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
