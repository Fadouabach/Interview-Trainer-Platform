import React, { useState } from 'react';
import { Terminal, Play, Mic } from 'lucide-react';
import './App.css';

import { Setup } from './components/Setup';
import { Session } from './components/Session';
import { Results } from './components/Results';

function App() {
  const [view, setView] = useState('home'); // home, setup, session, results
  const [category, setCategory] = useState(null);
  const [results, setResults] = useState([]);

  const startSetup = () => setView('setup');

  const startSession = (selectedCategory) => {
    setCategory(selectedCategory);
    setView('session');
  };

  const finishSession = (sessionResults) => {
    setResults(sessionResults);
    setView('results');
  };

  const reset = () => {
    setView('home');
    setCategory(null);
    setResults([]);
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="glass-panel" style={{
        margin: '1rem',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: '1rem',
        zIndex: 100
      }}>
        <div
          onClick={reset}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          <Terminal size={24} color="var(--primary)" />
          <span>Interview<span style={{ color: 'var(--primary)' }}>Trainer</span></span>
        </div>
        <div>
          {view !== 'home' && (
            <button className="btn" onClick={reset} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>
              Exit
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Routing */}
      <main style={{ paddingBottom: '4rem' }}>
        {view === 'home' && (
          <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
              <h1 className="fade-in">Master Your Interview</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Practice tech and behavioral questions with real-time feedback.
                Simulate the pressure and ace the real thing.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn" onClick={startSetup}>
                  <Play size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Start Practice
                </button>
                <button className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>
                  <Mic size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Test Audio
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
              {[
                { title: 'Real Questions', desc: 'Curated list of top tech interview questions.' },
                { title: 'AI Feedback', desc: 'Instant analysis of your answers and tone.' },
                { title: 'Mock Environment', desc: 'Timer and pressure simulation included.' }
              ].map((feature, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'setup' && <Setup onStart={startSession} />}

        {view === 'session' && <Session category={category} onFinish={finishSession} />}

        {view === 'results' && <Results results={results} onReset={reset} />}
      </main>
    </div>
  );
}

export default App;
