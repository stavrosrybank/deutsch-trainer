export default function StreakCounter({ streak }) {
  return (
    <div className="streak-card">
      <div className="streak-number">{streak}</div>
      <div className="streak-label">
        {streak === 1 ? 'Tag in Folge' : 'Tage in Folge'}
      </div>
      {streak >= 7 && <div className="streak-badge">🔥 Woche am Stück!</div>}
    </div>
  );
}
