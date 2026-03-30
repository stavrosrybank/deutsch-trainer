export default function NavBar({ activeTab, onTabChange, sessionCount }) {
  const tabs = [
    { id: 'practice', label: 'Schreiben' },
    { id: 'phraselog', label: 'Phrasen' },
    { id: 'vocab', label: 'Vokabeln' },
    { id: 'progress', label: 'Fortschritt' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-de">Deutsch</span>
        <span className="brand-trainer">Trainer</span>
      </div>
      <div className="navbar-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="navbar-meta">
        <span className="session-pill">{sessionCount} / 100</span>
      </div>
    </nav>
  );
}
