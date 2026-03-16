import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await axios.get('http://localhost:5002/api/admin/feedback', {
                    headers: { 'x-auth-token': token }
                });
                setFeedbacks(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Feedback Logs...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Feedback Monitoring</h1>
                <p style={{ color: 'var(--text-muted)' }}>Review AI-generated feedback to ensure quality and accuracy.</p>
            </header>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {feedbacks.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No AI feedback generated yet.
                    </div>
                ) : (
                    feedbacks.map(f => (
                        <div key={f.interviewId} className="card" style={{ overflow: 'hidden' }}>
                            <div 
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setExpanded(expanded === f.interviewId ? null : f.interviewId)}
                            >
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MessageSquare size={18} color="var(--primary)" />
                                        Session Feedback
                                    </h3>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '1rem' }}>
                                        <span>User ID: {f.userId}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={14} />
                                            {new Date(f.date).toLocaleString()}
                                        </span>
                                        <span style={{ fontWeight: '500', color: 'var(--primary)' }}>
                                            Score Graded: {f.overallScore}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    {expanded === f.interviewId ? <ChevronUp /> : <ChevronDown />}
                                </div>
                            </div>
                            
                            {expanded === f.interviewId && (
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>AI Summary</h4>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px' }}>
                                        {f.summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
