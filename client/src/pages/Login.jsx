import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

export function Login({ setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect path from location state, or default to /dashboard
    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (!res.success) {
            setError(res.message);
        } else {
            // Success! Navigate to the intended destination or dashboard
            if (navigate) {
                navigate(from, { replace: true });
            }
        }
    };

    const handleSignupClick = () => {
        if (setView) setView('signup');
        if (navigate) navigate('/signup');
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logo} alt="Confido" style={{ height: '60px', marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to continue your progress</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2', color: '#dc2626',
                        padding: '0.75rem', borderRadius: '8px',
                        marginBottom: '1rem', fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                    borderRadius: '8px', border: '1px solid var(--border-subtle)',
                                    outline: 'none', fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                    borderRadius: '8px', border: '1px solid var(--border-subtle)',
                                    outline: 'none', fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Sign In
                    </button>
                    <button type="button" onClick={() => navigate && navigate('/')} style={{ width: '100%', background: 'transparent', border: 'none', marginTop: '1rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        Back to Home
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Don't have an account?
                    <button
                        onClick={handleSignupClick}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary)',
                            fontWeight: '600', cursor: 'pointer', marginLeft: '0.25rem'
                        }}
                    >
                        Create one
                    </button>
                </div>
            </div>
        </div>
    );
}
