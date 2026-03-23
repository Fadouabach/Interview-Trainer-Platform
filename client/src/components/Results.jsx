import React from 'react';
import { Trophy, RefreshCw, Home, CheckCircle, XCircle, Lightbulb, TrendingUp, MessageSquare, Target, Zap, Clock } from 'lucide-react';

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
    const { result, strengths, weaknesses, questionReview, communication, improvementPlan } = aiFeedback;

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
                        {result?.finalScore || 0}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Final Score</h2>
                        <div style={{
                            padding: '0.5rem 1.5rem', background: '#3b82f6',
                            borderRadius: '20px', fontSize: '1rem', fontWeight: '700',
                            display: 'inline-block'
                        }}>
                            {result?.levelAssessment?.toUpperCase() || 'ASSESSING'} READINESS
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Key Insights (Strengths & Weaknesses) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '2rem', borderTop: '6px solid #10b981' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--success)' }}>
                        <CheckCircle size={22} /> Key Strengths
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
                        {strengths?.map((s, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
                                <div style={{ minWidth: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginTop: '0.5rem' }} />
                                {s}
                            </li>
                        ))}
                        {(!strengths || strengths.length === 0) && <p style={{ color: 'var(--text-muted)' }}>No specific strengths highlighted yet.</p>}
                    </ul>
                </div>

                <div className="card" style={{ padding: '2rem', borderTop: '6px solid #ef4444' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--danger)' }}>
                        <XCircle size={22} /> Critical Weaknesses
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
                        {weaknesses?.map((w, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
                                <div style={{ minWidth: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginTop: '0.5rem' }} />
                                {w}
                            </li>
                        ))}
                        {(!weaknesses || weaknesses.length === 0) && <p style={{ color: 'var(--text-muted)' }}>No critical weaknesses found. Great work!</p>}
                    </ul>
                </div>
            </div>

            {/* 3. Communication Review Dashboard */}
            <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    Communication Assessment
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <CommStat label="Clarity" value={communication?.clarity} />
                    <CommStat label="Structure" value={communication?.structure} />
                    <CommStat label="Confidence" value={communication?.confidence} />
                    <CommStat label="Language" value={communication?.language} />
                </div>
                <div style={{
                    marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-app)',
                    borderRadius: '16px', border: '1px solid var(--border-subtle)'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                        <Zap size={18} /> Pace & Hesitation Analysis
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>{communication?.paceAnalysis}</p>
                </div>
            </div>

            {/* 4. Question-by-Question Review */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Detailed Question Review</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {questionReview?.map((qReview, idx) => (
                        <div key={idx} className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '2rem' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{qReview.question}</h4>
                                <div style={{
                                    minWidth: '60px', height: '60px', borderRadius: '16px',
                                    background: qReview.score >= 7 ? '#dcfce7' : qReview.score >= 4 ? '#fffbeb' : '#fee2e2',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: qReview.score >= 7 ? '#166534' : qReview.score >= 4 ? '#92400e' : '#991b1b',
                                    fontWeight: '800', fontSize: '1.2rem'
                                }}>
                                    {qReview.score}/10
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                <ReviewSnippet icon={<CheckCircle size={18} color="#10b981" />} title="What was good" content={qReview.good} />
                                <ReviewSnippet icon={<XCircle size={18} color="#ef4444" />} title="What was missing" content={qReview.wrong} />
                            </div>

                            <div style={{
                                marginTop: '1.5rem', padding: '1.25rem', background: '#eff6ff',
                                borderRadius: '12px', border: '1px solid #dbeafe'
                            }}>
                                <h5 style={{ color: '#1e40af', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '800', textTransform: 'uppercase' }}>Expert Advice</h5>
                                <p style={{ color: '#1e3a8a', fontSize: '1rem' }}>{qReview.advice}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Actionable Improvement Plan */}
            <div className="card" style={{ padding: '3rem', background: '#f0f9ff', border: '2px solid #bae6fd', marginBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: '#bae6fd', color: '#0369a1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }}>
                        <Target size={32} />
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#0c4a6e' }}>The Road Ahead</h3>
                    <p style={{ color: '#0369a1' }}>Concrete steps to take before your next real interview.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0c4a6e' }}>
                            <Zap size={20} /> MUST STUDY
                        </h4>
                        <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {improvementPlan?.mustStudy?.map((item, i) => (
                                <li key={i} style={{ background: 'var(--bg-panel)', padding: '0.8rem 1.25rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0c4a6e' }}>
                            <TrendingUp size={20} /> EXERCISES
                        </h4>
                        <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {improvementPlan?.suggestedExercises?.map((item, i) => (
                                <li key={i} style={{ background: 'var(--bg-panel)', padding: '0.8rem 1.25rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{
                    marginTop: '3rem', padding: '2rem', background: '#0369a1',
                    borderRadius: '20px', color: 'white', textAlign: 'center'
                }}>
                    <h4 style={{ fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>The #1 Priority</h4>
                    <p style={{ fontSize: '1.4rem', fontWeight: '700' }}>"{improvementPlan?.nextFix}"</p>
                </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem' }}>
                <button className="btn" onClick={onReset} style={{ padding: '1.25rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '16px' }}>
                    <Home size={22} /> Back to Dashboard
                </button>
                <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '1.25rem 2.5rem', borderRadius: '16px' }}>
                    Save Evaluation (PDF)
                </button>
            </div>
        </div>
    );
}

function CommStat({ label, value }) {
    return (
        <div style={{ padding: '1.25rem', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{value || 'Assessing...'}</div>
        </div>
    );
}

function ReviewSnippet({ icon, title, content }) {
    return (
        <div>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                {icon} {title.toUpperCase()}
            </h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>{content || "No specific comments."}</p>
        </div>
    );
}

