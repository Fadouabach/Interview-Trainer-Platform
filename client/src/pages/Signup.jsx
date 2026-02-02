import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export function Signup({ setView }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Minimal validataion for name
        if (!name) return setError("Name is required");

        const res = await register({ name, email, password });
        if (!res.success) {
            setError(res.message);
        } else {
            if (navigate) navigate('/dashboard');
        }
    };

    const handleLoginClick = () => {
        if (setView) setView('login');
        if (navigate) navigate('/login');
    };

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
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Join thousands of developers practicing daily</p>
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                    borderRadius: '8px', border: '1px solid var(--border-subtle)',
                                    outline: 'none', fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>
                    </div>

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
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Sign Up
                    </button>
                    <button type="button" onClick={() => navigate && navigate('/')} style={{ width: '100%', background: 'transparent', border: 'none', marginTop: '1rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        Back to Home
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account?
                    <button
                        onClick={handleLoginClick}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary)',
                            fontWeight: '600', cursor: 'pointer', marginLeft: '0.25rem'
                        }}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
