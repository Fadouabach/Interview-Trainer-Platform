import React from 'react';
import { Trophy, RefreshCw, Home } from 'lucide-react';

export function Results({ onReset }) {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem auto',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
                }}>
                    <Trophy size={40} color="white" />
                </div>

                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Interview Completed!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>
                    Great job practicing. Review your answers or start a new session to keep improving.
                </p>

                {/* Recorded Answers */}
                <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', marginBottom: '3rem', textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Your Answers</h4>

                    {results && results.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {results.map((res, idx) => (
                                <div key={idx} style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                                        Q{idx + 1}: {res.questionText}
                                    </p>
                                    <audio controls src={res.audioUrl} style={{ width: '100%', marginTop: '0.5rem' }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>No answers recorded.</p>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn" onClick={onReset}>
                        <Home size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
