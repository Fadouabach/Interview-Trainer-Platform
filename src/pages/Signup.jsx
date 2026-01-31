import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, Mail, User } from 'lucide-react';

export function Signup({ setView }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register({ name, email, password });
        if (!res.success) {
            setError(res.message);
        }
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
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '48px', height: '48px',
                        background: 'var(--primary)',
                        borderRadius: '12px',
                        color: 'white',
                        marginBottom: '1rem'
                    }}>
                        <Terminal size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Join the interview success platform</p>
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
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Register
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account?
                    <button
                        onClick={() => setView('login')}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary)',
                            fontWeight: '600', cursor: 'pointer', marginLeft: '0.25rem'
                        }}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}
