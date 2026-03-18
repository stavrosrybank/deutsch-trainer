import ProgressBar from './ProgressBar';
import StreakCounter from './StreakCounter';
import CategoryBreakdown from './CategoryBreakdown';
import { useProgress } from '../../hooks/useProgress';

export default function Progress({ sessions }) {
  const { sessionCount, streak, categoryCounts } = useProgress(sessions);

  return (
    <div className="progress-container">
      <h1 className="page-title">Fortschritt</h1>

      <ProgressBar count={sessionCount} goal={100} />

      <div className="progress-cards">
        <StreakCounter streak={streak} />
        <CategoryBreakdown categoryCounts={categoryCounts} />
      </div>
    </div>
  );
}
