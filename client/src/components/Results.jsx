import React from 'react';
import { Trophy, RefreshCw, Home } from 'lucide-react';

export function Results({ results, onReset }) {
    // Checking if we have valid feedback data
    // If results is the session object (from App.jsx setResults(response.data))
    // then results.aiFeedback should exist.
    // If results is just the array (fallback), we might miss overall data.

    // We expect 'results' to be the full session object now.

    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>

                {/* Overall Score Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 10px 25px rgba(251, 191, 36, 0.4)',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        {results.aiFeedback ? results.aiFeedback.overallScore : 0}%
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Interview Analysis</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Here represents your detailed performance review.</p>
                </div>

                {/* Detailed Scores Grid */}
                {results.aiFeedback && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <ScoreCard icon={<Trophy size={24} />} title="Communication" score={results.aiFeedback.communicationScore} color="#3b82f6" />
                        <ScoreCard icon={<Trophy size={24} />} title="Technical" score={results.aiFeedback.technicalScore} color="#8b5cf6" />
                        <ScoreCard icon={<Trophy size={24} />} title="Confidence" score={results.aiFeedback.confidenceScore} color="#10b981" />
                        <ScoreCard icon={<Trophy size={24} />} title="Readiness" score={results.aiFeedback.readinessScore} color="#ec4899" />
                    </div>
                )}

                {/* Personalized Advice */}
                {results.aiFeedback && (
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '3rem', textAlign: 'left', borderLeft: '4px solid #3b82f6' }}>
                        <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem', fontWeight: 'bold' }}>💡 Personalized Coach Advice</h4>
                        <p style={{ lineHeight: '1.6' }}>{results.aiFeedback.personalizedAdvice}</p>
                    </div>
                )}

                {/* Question Breakdown */}
                <div style={{ textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Question Breakdown</h3>

                    {results.answers && results.answers.map((ans, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h4 style={{ fontWeight: '600' }}>Q{idx + 1}: {ans.questionText || "Question"}</h4>
                                <span style={{ fontWeight: 'bold', color: ans.feedback?.score >= 70 ? '#10b981' : '#ef4444' }}>
                                    Score: {ans.feedback?.score || 0}/100
                                </span>
                            </div>

                            {/* Audio & Transcript */}
                            <div style={{ marginBottom: '1rem' }}>
                                {ans.audioUrl && <audio controls src={ans.audioUrl} style={{ width: '100%', marginBottom: '0.5rem' }} />}
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: '4px' }}>
                                    "{ans.transcribedText || "No transcript available."}"
                                </p>
                            </div>

                            {/* Feedback Details */}
                            {ans.feedback && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <h5 style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>✅ Strengths</h5>
                                        <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem', margin: 0 }}>
                                            {ans.feedback.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>No specific strengths noted.</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>❌ Improvements</h5>
                                        <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem', margin: 0 }}>
                                            {ans.feedback.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>No specific weaknesses noted.</li>}
                                        </ul>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                        <h5 style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>💫 Tips</h5>
                                        <p style={{ fontSize: '0.9rem' }}>{ans.feedback.tips?.join(' ') || "Keep practicing!"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem' }}>
                    <button className="btn" onClick={onReset}>
                        <Home size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Back to Dashboard
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.print()}>
                        Save Results
                    </button>
                </div>
            </div>
        </div>
    );
}

function ScoreCard({ icon, title, score, color }) {
    return (
        <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px', borderTop: `4px solid ${color}` }}>
            <div style={{ color: color, marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}%</div>
        </div>
    );
}
