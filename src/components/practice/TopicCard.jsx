import { useState, useEffect, useCallback } from 'react';

export default function TopicCard({ onTopicChange }) {
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState(null);
  const [recentIds, setRecentIds] = useState([]);

  useEffect(() => {
    fetch('/topics.json')
      .then((r) => r.json())
      .then((data) => {
        setTopics(data);
        pickRandom(data, []);
      });
  }, []);

  const pickRandom = useCallback(
    (pool, excluded) => {
      const available = (pool || topics).filter((t) => !excluded.includes(t.id));
      if (!available.length) return;
      const picked = available[Math.floor(Math.random() * available.length)];
      setTopic(picked);
      const next = [...excluded, picked.id].slice(-5);
      setRecentIds(next);
      onTopicChange(picked);
    },
    [topics, onTopicChange]
  );

  const CATEGORY_LABELS = {
    'daily-life': 'Alltag',
    work: 'Arbeit',
    travel: 'Reisen',
    food: 'Essen',
    opinions: 'Meinungen',
    childhood: 'Kindheit',
    future: 'Zukunft',
    berlin: 'Berlin',
    relationships: 'Beziehungen',
    culture: 'Kultur',
  };

  return (
    <div className="topic-card">
      <div className="topic-header">
        <span className="topic-category-chip">
          {topic ? (CATEGORY_LABELS[topic.category] || topic.category) : '…'}
        </span>
        <button
          className="btn-ghost"
          onClick={() => pickRandom(topics, recentIds)}
          disabled={!topics.length}
          title="Neues Thema"
        >
          Anderes Thema →
        </button>
      </div>
      <p className="topic-text">{topic ? topic.topic : 'Themen werden geladen…'}</p>
    </div>
  );
}
