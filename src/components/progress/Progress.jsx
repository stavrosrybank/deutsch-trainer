import ProgressBar from './ProgressBar';
import StreakCounter from './StreakCounter';
import CategoryBreakdown from './CategoryBreakdown';
import VocabStats from './VocabStats';
import { useProgress } from '../../hooks/useProgress';

export default function Progress({ sessions, vocab }) {
  const { sessionCount, streak, categoryCounts, vocabTotal, vocabByStatus, quizCount, quizAccuracy } =
    useProgress(sessions, vocab);

  return (
    <div className="progress-container">
      <h1 className="page-title">Fortschritt</h1>

      <ProgressBar count={sessionCount} goal={100} />

      <div className="progress-cards">
        <StreakCounter streak={streak} />
        <CategoryBreakdown categoryCounts={categoryCounts} />
      </div>

      <VocabStats
        vocabTotal={vocabTotal}
        vocabByStatus={vocabByStatus}
        quizCount={quizCount}
        quizAccuracy={quizAccuracy}
      />
    </div>
  );
}
