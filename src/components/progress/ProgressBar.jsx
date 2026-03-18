export default function ProgressBar({ count, goal = 100 }) {
  const pct = Math.min(100, Math.round((count / goal) * 100));

  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-header">
        <span className="progress-bar-label">Ziel 2026: {goal} Übungen</span>
        <span className="progress-bar-count">
          {count} / {goal}
        </span>
      </div>
      <div className="progress-bar-track" role="progressbar" aria-valuenow={count} aria-valuemax={goal}>
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-bar-pct">{pct}% erreicht</p>
    </div>
  );
}
