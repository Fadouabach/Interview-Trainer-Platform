import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Components
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ExpertSessions } from './components/ExpertSessions';
import { Profile } from './components/Profile';
import { Setup } from './components/Setup';
import { Session } from './components/Session';
import { Results } from './components/Results';
import { Footer } from './components/Footer';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { LandingPage } from './pages/LandingPage';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Authenticated Application Layout
function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [category, setCategory] = useState(null);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);

  const startSession = (selectedCategory) => {
    setCategory(selectedCategory);
    navigate('/session');
  };

  const finishSession = async (sessionResults) => {
    setProcessing(true);
    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('category', category || 'General');
    formData.append('duration', 300);

    const answersMetadata = sessionResults.map(r => ({
      questionId: r.questionId,
      questionText: r.questionText,
      recorded: r.recorded,
    }));

    formData.append('answers', JSON.stringify(answersMetadata));

    sessionResults.forEach((res, index) => {
      if (res.recorded && res.audioBlob) {
        formData.append(`audio_${index}`, res.audioBlob, `answer_${index}.webm`);
      }
    });

    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.post('http://localhost:5001/api/interviews', formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data);
      navigate('/results');
    } catch (err) {
      console.error("Failed to save session", err);
      alert("Failed to process interview. Please check console.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setCategory(null);
    setResults([]);
    navigate('/dashboard');
  };

  const isImmersive = location.pathname === '/session';

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      {!isImmersive && <Sidebar onLogout={logout} />}
      <main style={{ flex: 1, marginLeft: isImmersive ? 0 : '260px', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard onStartPractice={() => navigate('/setup')} user={user} />} />
          <Route path="setup" element={
            <ProtectedRoute>
              <div className="container" style={{ marginTop: '4rem' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
                  <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>← Back to Dashboard</button>
                  <Setup onStart={startSession} />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="session" element={<ProtectedRoute><Session category={category} onFinish={finishSession} /></ProtectedRoute>} />
          <Route path="results" element={<ProtectedRoute><Results results={results} onReset={reset} /></ProtectedRoute>} />
          <Route path="experts" element={<ExpertSessions />} />
          <Route path="profile" element={<ProtectedRoute><Profile user={user} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
        {!isImmersive && <Footer />}
      </main>
      {processing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, color: 'white' }}>
          <div className="pulse" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔮 Analyzing Session...</div>
          <p>Generating personalized AI feedback...</p>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route path="/signup" element={<SignupPageWrapper />} />

          {/* Main Application with Sidebar */}
          <Route path="/*" element={<AuthenticatedLayout />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Wrappers to handle internal state of Login/Signup pages if they expect props
function LoginPageWrapper() {
  const [view, setView] = useState('login'); // local state dummy
  // Assuming Login component handles navigation or context updates
  // We need to pass setView if Login expects it to toggle to Register, 
  // but better to use Links in Login/Signup now.
  // Let's wrap them slightly or update them.
  // For now, let's just render them. 
  // The Login component expects 'setView' to switch to 'register'.
  // We should duplicate that logic or update Login.jsx. 
  // Let's pass a dummy or specific handler.
  const navigate = React.useCallback((v) => {
    if (v === 'register' || v === 'signup') window.location.href = '/signup';
    if (v === 'login') window.location.href = '/login';
  }, []);

  return <Login setView={navigate} />;
}

function SignupPageWrapper() {
  const navigate = React.useCallback((v) => {
    if (v === 'login') window.location.href = '/login';
  }, []);
  return <Signup setView={navigate} />;
}

export default App;
