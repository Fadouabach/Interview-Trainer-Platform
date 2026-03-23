import React from 'react';
import { Trophy, RefreshCw, Home, CheckCircle, XCircle, Lightbulb, TrendingUp, MessageSquare, Target, Zap, Clock, Star, AlertCircle } from 'lucide-react';

export function Results({ results, onReset }) {
    // If no results or feedback, show fallback
    if (!results || !results.aiFeedback) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <div className="card" style={{ padding: '3rem' }}>
                    <h2>No interview analysis found.</h2>
                    <button className="btn" onClick={onReset} style={{ marginTop: '1rem' }}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const { aiFeedback, answers } = results;
    const { overallScore, topStrengths, topImprovements, levelAssessment, communicationSummary, nextSteps } = aiFeedback;

    return (
        <div style={{ width: '100%', maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>

            {/* 1. Overall Result Header */}
            <div className="card" style={{
                padding: '3rem',
                textAlign: 'center',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white',
                borderRadius: '32px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)', border: '4px solid #3b82f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', fontWeight: '800'
                    }}>
                        {overallScore || 0}%
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Overall Score</h2>
                        <div style={{
                            padding: '0.5rem 1.5rem', background: '#3b82f6',
                            borderRadius: '20px', fontSize: '1rem', fontWeight: '700',
                            display: 'inline-block'
                        }}>
                            {levelAssessment?.toUpperCase() || 'ASSESSING'} READINESS
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Top Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '2rem', borderTop: '6px solid #10b981' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#10b981' }}>
                        <CheckCircle size={22} /> Top 3 Strengths
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
                        {topStrengths?.map((s, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
                                <div style={{ minWidth: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginTop: '0.5rem' }} />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card" style={{ padding: '2rem', borderTop: '6px solid #f59e0b' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#f59e0b' }}>
                        <Target size={22} /> Key Improvements
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 0 }}>
                        {topImprovements?.map((imp, i) => (
                            <li key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>{imp.area}</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{imp.tip}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 3. Communication Summary */}
            <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>Communication Assessment</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>{communicationSummary}</p>
            </div>

            {/* 4. Detailed Question Review */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Detailed Question Review</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {answers?.map((ans, idx) => (
                        <div key={idx} className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '2rem' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{ans.questionText}</h4>
                                <div style={{
                                    minWidth: '60px', height: '60px', borderRadius: '16px',
                                    background: ans.feedback?.score >= 4 ? '#dcfce7' : ans.feedback?.score >= 3 ? '#fffbeb' : '#fee2e2',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    color: ans.feedback?.score >= 4 ? '#166534' : ans.feedback?.score >= 3 ? '#92400e' : '#991b1b'
                                }}>
                                    <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{ans.feedback?.score}/5</div>
                                </div>
                            </div>

                            {/* Categorized Strengths */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <StrengthBox label="Content" text={ans.feedback?.strengths?.content} />
                                <StrengthBox label="Clarity" text={ans.feedback?.strengths?.clarity} />
                                <StrengthBox label="Vocabulary" text={ans.feedback?.strengths?.vocabulary} />
                                <StrengthBox label="Structure" text={ans.feedback?.strengths?.structure} />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                                    <Zap size={16} color="#f59e0b" /> Actionable Suggestions
                                </h5>
                                <ul style={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {ans.feedback?.suggestions?.map((s, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                            <span style={{ color: '#f59e0b' }}>•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {ans.feedback?.improvedAnswer && (
                                <div style={{
                                    marginTop: '1rem', padding: '1.25rem', background: '#f5f3ff',
                                    borderRadius: '12px', border: '1px solid #ede9fe'
                                }}>
                                    <h5 style={{ color: '#5b21b6', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Lightbulb size={16} /> Improved Sample Answer
                                    </h5>
                                    <p style={{ color: '#4c1d95', fontSize: '1.05rem', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>"{ans.feedback?.improvedAnswer}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Next Steps */}
            <div className="card" style={{ padding: '3rem', background: '#eff6ff', border: '2px solid #3b82f6', marginBottom: '4rem', textAlign: 'center' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: '#3b82f6', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <Zap size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '1rem' }}>Your Number One Priority</h3>
                <p style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1e40af', maxWidth: '600px', margin: '0 auto' }}>"{nextSteps}"</p>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem' }}>
                <button className="btn" onClick={onReset} style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Home size={20} /> Dashboard
                </button>
                <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '1rem 2rem' }}>
                    Print Report
                </button>
            </div>
        </div>
    );
}

function StrengthBox({ label, text }) {
    if (!text) return null;
    return (
        <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{text}</div>
        </div>
    );
}
