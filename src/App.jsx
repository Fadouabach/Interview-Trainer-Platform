import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ExpertSessions } from './components/ExpertSessions';
import { Profile } from './components/Profile';
import { Setup } from './components/Setup';
import { Session } from './components/Session';
import { Results } from './components/Results';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [view, setView] = useState('dashboard'); // dashboard, setup, session, results, experts, profile
  const [category, setCategory] = useState(null);
  const [results, setResults] = useState([]);

  // Navigation handlers
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
    setView('dashboard');
    setCategory(null);
    setResults([]);
  };

  const isImmersive = view === 'session';

  if (!user) return null;

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      {!isImmersive && (
        <Sidebar currentView={view} setView={setView} onLogout={logout} />
      )}

      <main style={{
        flex: 1,
        marginLeft: isImmersive ? 0 : '260px',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)'
      }}>
        {view === 'dashboard' && (
          <Dashboard onStartPractice={startSetup} user={user} />
        )}

        {view === 'experts' && (
          <ExpertSessions />
        )}

        {view === 'profile' && (
          <Profile user={user} />
        )}

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

function App() {
  const [authView, setAuthView] = useState('login');

  return (
    <AuthProvider>
      <AuthWrapper authView={authView} setAuthView={setAuthView} />
    </AuthProvider>
  );
}

function AuthWrapper({ authView, setAuthView }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-app)' }}>Loading...</div>;

  if (!user) {
    return authView === 'login'
      ? <Login setView={setAuthView} />
      : <Signup setView={setAuthView} />;
  }

  return <AuthenticatedApp />;
}

export default App;
