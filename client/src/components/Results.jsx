import React from 'react';
import { Trophy, RefreshCw, Home } from 'lucide-react';

export function Results({ results, onReset }) {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div className="card" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem auto',
                    boxShadow: '0 10px 25px rgba(251, 191, 36, 0.4)'
                }}>
                    <Trophy size={40} color="white" />
                </div>

                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Interview Completed!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>
                    Great job practicing. Review your answers or start a new session to keep improving.
                </p>

                {/* Recorded Answers */}
                <div style={{ background: 'var(--bg-app)', padding: '2rem', borderRadius: '12px', marginBottom: '3rem', textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Your Session Recording
                    </h4>

                    {results && results.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {results.map((res, idx) => (
                                <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                                    <p style={{ fontWeight: '600', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                                        Q{idx + 1}: {res.questionText}
                                    </p>
                                    <audio controls src={res.audioUrl} style={{ width: '100%' }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No answers were recorded during this session.</p>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn" onClick={onReset}>
                        <Home size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
