import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import TopicCard from './TopicCard';
import WritingArea from './WritingArea';
import AnalysisResult from './AnalysisResult';
import { analyzeWriting, generatePatternReport } from '../../services/claude';
import { savePhrases, savePatternReport, getSessions } from '../../services/storage';
import { useSessions } from '../../hooks/useSessions';

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export default function Practice({ apiKey }) {
  const [topic, setTopic] = useState(null);
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sessions, addSession } = useSessions();

  const handleSubmit = async () => {
    if (!topic || !text.trim()) return;
    setLoading(true);
    setError('');

    try {
      const result = await analyzeWriting(apiKey, topic, text);

      const now = new Date().toISOString();
      const sessionId = uuid();
      const session = {
        id: sessionId,
        date: now,
        topic,
        userText: text,
        analysis: result,
      };

      addSession(session);

      // Denormalize corrections into phrase log
      if (result.corrections?.length) {
        const month = now.slice(0, 7);
        const week = getISOWeek(now);
        const phrases = result.corrections.map((c) => ({
          id: uuid(),
          sessionId,
          date: now,
          topic: topic.topic,
          week,
          month,
          original: c.original,
          improved: c.improved,
          explanation: c.explanation,
          category: c.category,
          learned: false,
        }));
        savePhrases(phrases);
      }

      // Trigger pattern report every 5 sessions
      const allSessions = getSessions();
      if (allSessions.length % 5 === 0 && allSessions.length > 0) {
        const last5 = allSessions.slice(-5);
        const report = await generatePatternReport(apiKey, last5);
        savePatternReport({
          id: uuid(),
          date: now,
          sessionIds: last5.map((s) => s.id),
          week: getISOWeek(now),
          report,
        });
      }

      setAnalysis(result);
    } catch (err) {
      setError(`Fehler: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = useCallback(() => {
    setAnalysis(null);
    setText('');
    setError('');
  }, []);

  return (
    <div className="practice-container">
      <TopicCard onTopicChange={setTopic} />

      {!analysis ? (
        <>
          <WritingArea
            value={text}
            onChange={setText}
            onSubmit={handleSubmit}
            loading={loading}
          />
          {error && <p className="error-message">{error}</p>}
        </>
      ) : (
        <AnalysisResult analysis={analysis} onNewSession={handleNewSession} />
      )}
    </div>
  );
}
