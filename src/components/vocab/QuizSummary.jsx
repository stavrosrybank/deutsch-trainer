export default function QuizSummary({ totalQuestions, correctAnswers, onClose }) {
  const pct = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  let message;
  if (pct >= 90) message = 'Ausgezeichnet! Du bist auf einem tollen Weg.';
  else if (pct >= 70) message = 'Gut gemacht! Weitermachen — du verbesserst dich stetig.';
  else if (pct >= 50) message = 'Solider Anfang! Übe die schwierigen Wörter öfter.';
  else message = 'Kein Problem — Wiederholung ist der Schlüssel zum Lernen!';

  return (
    <div className="quiz-summary">
      <h2 className="quiz-summary-title">Zusammenfassung</h2>
      <div className="quiz-summary-score">
        <span className="quiz-summary-number">{correctAnswers}</span>
        <span className="quiz-summary-denom"> / {totalQuestions}</span>
      </div>
      <div className="quiz-summary-pct">{pct}% richtig</div>
      <p className="quiz-summary-msg">{message}</p>
      <button className="btn-primary" onClick={onClose}>Fertig</button>
    </div>
  );
}
