import { useState } from 'react';

export default function QuizQuestion({ question, onAnswer }) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || submitted) return;
    const isCorrect =
      input.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    setCorrect(isCorrect);
    setSubmitted(true);
  };

  const handleNext = () => {
    onAnswer(correct);
    setInput('');
    setSubmitted(false);
    setCorrect(false);
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
          />
          <button type="submit" className="btn-primary" disabled={!input.trim()}>
            Antworten
          </button>
        </form>
      ) : (
        <div className={`quiz-result ${correct ? 'quiz-result--correct' : 'quiz-result--wrong'}`}>
          <p className="quiz-result-verdict">
            {correct ? '✅ Richtig!' : `❌ Falsch — richtige Antwort: ${question.correctAnswer}`}
          </p>
          <p className="quiz-result-explanation">{question.explanation}</p>
          <button className="btn-primary" onClick={handleNext}>
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
