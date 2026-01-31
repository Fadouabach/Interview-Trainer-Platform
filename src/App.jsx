import React, { useState } from 'react';
import './App.css';

// Components
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ExpertSessions } from './components/ExpertSessions';
import { Profile } from './components/Profile';
import { Setup } from './components/Setup';
import { Session } from './components/Session';
import { Results } from './components/Results';

function App() {
  const [view, setView] = useState('dashboard'); // dashboard, setup, session, results, experts, profile
  const [category, setCategory] = useState(null);
  const [results, setResults] = useState([]);

  // Navigation handlers
  const startSetup = () => setView('setup');

  const startSession = (selectedCategory) => {
    console.log('Starting session with category:', selectedCategory);
    setCategory(selectedCategory);
    setView('session');
  };

  const finishSession = (sessionResults) => {
    console.log('Finishing session with results:', sessionResults);
    setResults(sessionResults);
    setView('results');
  };

  const reset = () => {
    setView('dashboard');
    setCategory(null);
    setResults([]);
  };

  // Views that should hide the Sidebar (e.g. active session for focus)
  const isImmersive = view === 'session';

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      {!isImmersive && (
        <Sidebar currentView={view} setView={setView} />
      )}

      <main style={{
        flex: 1,
        marginLeft: isImmersive ? 0 : '260px',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)'
      }}>
        {view === 'dashboard' && (
          <Dashboard onStartPractice={startSetup} />
        )}

        {view === 'experts' && (
          <ExpertSessions />
        )}

        {view === 'profile' && (
          <Profile />
        )}

        {/* Existing Flows */}
        {view === 'setup' && (
          <div className="container" style={{ marginTop: '4rem' }}>
            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
              <button onClick={() => setView('dashboard')} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>← Back to Dashboard</button>
              <Setup onStart={startSession} />
            </div>
          </div>
        )}

        {view === 'session' && (
          <Session category={category} onFinish={finishSession} />
        )}

        {view === 'results' && (
          <Results results={results} onReset={reset} />
        )}
      </main>
    </div>
  );
}

export default App;
