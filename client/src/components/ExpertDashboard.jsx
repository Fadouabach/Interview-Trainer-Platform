import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, Clock, CheckCircle, XCircle, Star, User,
    ChevronRight, FileText, MessageSquare, Award, BarChart2,
    Loader2, AlertCircle, Edit3, Save, X, Check, ArrowLeft,
    TrendingUp, Hash, Camera, BookOpen, History, Video, Info,
    Github, Linkedin, Globe, ExternalLink, Trash2, Plus, Briefcase, MapPin, Phone, Mail, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

const API = 'http://localhost:5002/api/expert';

// ─── Toast System ─────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
    return (
        <div style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            zIndex: 9999, maxWidth: '360px'
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1rem 1.25rem',
                    background: t.type === 'success' ? '#ecfdf5' : t.type === 'error' ? '#fef2f2' : '#eff6ff',
                    border: `1px solid ${t.type === 'success' ? '#bbf7d0' : t.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
                    borderRadius: '14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
                    animation: 'slideInRight 0.3s ease',
                }}>
                    {t.type === 'success' ? <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} /> :
                        t.type === 'error' ? <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} /> :
                            <AlertCircle size={18} color="#3b82f6" style={{ flexShrink: 0 }} />}
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', flex: 1 }}>{t.message}</span>
                    <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '0' }}>
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const add = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
    const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));
    return { toasts, success: m => add(m, 'success'), error: m => add(m, 'error'), info: m => add(m, 'info'), remove };
}

// ─── Shared Components ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, gradient }) {
    return (
        <div style={{
            background: gradient || 'white', borderRadius: '20px',
            padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem',
            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(148,163,184,0.12)',
            transition: 'transform 0.2s, box-shadow 0.2s',
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(0,0,0,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(0,0,0,0.1)'; }}
        >
            <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: `0 8px 20px -4px ${color}60`, flexShrink: 0
            }}>
                {React.cloneElement(icon, { size: 26, color: 'white' })}
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
            </div>
        </div>
    );
}

function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem' }}>
            <Loader2 size={36} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{text}</span>
        </div>
    );
}

function EmptyState({ icon, title, subtitle }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(icon, { size: 32, color: 'var(--text-light)' })}
            </div>
            <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>{title}</div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{subtitle}</div>
            </div>
        </div>
    );
}

function ScorePill({ score, small }) {
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    const bg = score >= 75 ? '#ecfdf5' : score >= 50 ? '#fffbeb' : '#fef2f2';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: small ? '0.2rem 0.6rem' : '0.35rem 0.85rem',
            borderRadius: '99px', background: bg, color: color,
            fontWeight: 700, fontSize: small ? '0.78rem' : '0.88rem', border: `1px solid ${color}30`
        }}>
            <Star size={small ? 11 : 13} /> {score}%
        </span>
    );
}

function Avatar({ name, avatar, size = 42 }) {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
    if (avatar && avatar !== '') {
        return (
            <img src={avatar.startsWith('/') ? `http://localhost:5002${avatar}` : avatar}
                alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
        );
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: size > 50 ? '1.2rem' : '0.85rem',
            border: '2px solid #e2e8f0', flexShrink: 0
        }}>
            {initials}
        </div>
    );
}

// ─── Section 1: Overview ──────────────────────────────────────────────────────
function OverviewSection({ token }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API}/stats`, { headers: { 'x-auth-token': token } });
                setStats(res.data);
            } catch (err) {
                console.error('Failed to load stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    if (loading) return <LoadingSpinner text="Loading your overview..." />;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Overview</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Your activity summary at a glance.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <StatCard icon={<BarChart2 />} label="Total Reviewed" value={stats?.totalReviewed ?? 0} color="#4f46e5" />
                <StatCard icon={<Clock />} label="Pending Requests" value={stats?.pendingCount ?? 0} color="#f59e0b" />
                <StatCard icon={<CheckCircle />} label="Accepted Candidates" value={stats?.acceptedCount ?? 0} color="#10b981" />
            </div>

            {/* Tips Card */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '20px', padding: '2rem', color: 'white'
            }}>
                <h3 style={{ color: 'white', marginBottom: '0.75rem', fontSize: '1.15rem' }}>💡 Expert Tips</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {[
                        'Review candidates thoroughly before making a decision.',
                        'Add meaningful feedback to help candidates grow.',
                        'Adjust the AI score if you feel it doesn\'t reflect the true performance.',
                    ].map((tip, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', opacity: 0.92 }}>
                            <span style={{ marginTop: '2px', flexShrink: 0 }}>✦</span> {tip}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// ─── Section 2 & 3: Pending Requests + Review Modal ──────────────────────────
function InterviewReviewModal({ interview, token, onClose, onSave, toast }) {
    const [feedback, setFeedback] = useState('');
    const [adjustedScore, setAdjustedScore] = useState(interview?.score ?? 0);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('review');
    const [liveCall, setLiveCall] = useState(interview?.liveCallActive ? { roomName: interview.liveCallRoom } : null);

    const startCall = async () => {
        try {
            const res = await axios.post(`${API}/interviews/${interview._id || interview.id}/start-call`, {}, { headers: { 'x-auth-token': token } });
            setLiveCall({ roomName: res.data.roomName });
            toast.success('Live call started!');
        } catch (err) {
            toast.error('Failed to start call');
        }
    };

    const stopCall = async () => {
        try {
            await axios.post(`${API}/interviews/${interview._id || interview.id}/stop-call`, {}, { headers: { 'x-auth-token': token } });
            setLiveCall(null);
            toast.info('Call ended');
        } catch (err) {
            toast.error('Failed to end call');
        }
    };

    const handleEvaluate = async (decision) => {
        if (!feedback.trim() && decision === 'accepted') {
            toast.error('Please add feedback before accepting.');
            return;
        }
        setSaving(true);
        try {
            await axios.put(
                `${API}/interviews/${interview._id || interview.id}/evaluate`,
                { decision, feedback, adjustedScore },
                { headers: { 'x-auth-token': token } }
            );
            toast.success(`Candidate ${decision === 'accepted' ? 'accepted ✅' : 'rejected ❌'} successfully!`);
            onSave(decision);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to save evaluation.');
        } finally {
            setSaving(false);
        }
    };

    const candidate = {
        name: interview.candidateName || 'Unknown',
        avatar: interview.candidateAvatar || '',
        email: interview.candidateEmail || '',
    };
    const aiScore = interview.aiFeedback?.overallScore ?? interview.score ?? 0;
    const answers = interview.answers || [];

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            zIndex: 1000, overflowY: 'auto', padding: '2rem 1rem'
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: 'var(--bg-panel)', borderRadius: '24px', width: '100%', maxWidth: '760px',
                boxShadow: '0 25px 60px -10px rgba(0,0,0,0.3)', overflow: 'hidden',
                animation: 'slideUp 0.3s ease'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Avatar name={candidate.name} avatar={candidate.avatar} size={52} />
                        <div>
                            <h3 style={{ color: 'white', marginBottom: '0.2rem', fontSize: '1.15rem' }}>{candidate.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{candidate.email}</span>
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)', color: 'white',
                                    padding: '0.2rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem'
                                }}>{interview.category}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs for Review vs Video */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-app)' }}>
                    <button 
                        onClick={() => setActiveTab('review')}
                        style={{
                            padding: '1rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
                            fontWeight: 600, color: activeTab === 'review' ? '#4f46e5' : '#64748b',
                            borderBottom: `2px solid ${activeTab === 'review' ? '#4f46e5' : 'transparent'}`,
                            transition: 'all 0.2s'
                        }}
                    >
                        Evaluation Review
                    </button>
                    <button 
                        onClick={() => setActiveTab('video')}
                        style={{
                            padding: '1rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
                            fontWeight: 600, color: activeTab === 'video' ? '#4f46e5' : '#64748b',
                            borderBottom: `2px solid ${activeTab === 'video' ? '#4f46e5' : 'transparent'}`,
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}
                    >
                        <Video size={16} /> Video Meeting {liveCall && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>}
                    </button>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                    {activeTab === 'review' ? (
                        <>
                            {/* Score Overview */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                        {[
                            { label: 'Overall AI Score', val: `${aiScore}%`, color: '#4f46e5' },
                            { label: 'Communication', val: `${interview.aiFeedback?.communicationScore ?? '—'}%`, color: '#0ea5e9' },
                            { label: 'Technical', val: `${interview.aiFeedback?.technicalScore ?? '—'}%`, color: 'var(--success)' },
                            { label: 'Confidence', val: `${interview.aiFeedback?.confidenceScore ?? '—'}%`, color: 'var(--warning)' },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'var(--bg-app)', borderRadius: '14px', padding: '1rem', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ color: s.color, fontWeight: 700, fontSize: '1.4rem' }}>{s.val}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* AI Advice */}
                    {interview.aiFeedback?.personalizedAdvice && (
                        <div style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '14px', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                                <BookOpen size={18} color="#0ea5e9" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--info)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>AI Personalized Advice</div>
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: 1.6 }}>{interview.aiFeedback.personalizedAdvice}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Q&A Section */}
                    {answers.length > 0 && (
                        <div>
                            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                <MessageSquare size={18} color="#4f46e5" /> Interview Q&A ({answers.length} questions)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                                {answers.map((ans, i) => (
                                    <div key={i} style={{ background: 'var(--bg-app)', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: '#4f46e5', fontSize: '0.85rem' }}>Q{i + 1}</span>
                                            {ans.feedback?.score != null && <ScorePill score={ans.feedback.score} small />}
                                        </div>
                                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.6rem', fontSize: '0.92rem' }}>{ans.questionText}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>
                                            {ans.transcribedText || <em style={{ color: 'var(--text-light)' }}>No answer recorded</em>}
                                        </p>
                                        {ans.feedback?.summary && (
                                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Feedback: </span>
                                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{ans.feedback.summary}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Expert Evaluation Form */}
                    <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                            <Edit3 size={18} color="#4f46e5" /> Your Expert Evaluation
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Adjust Score */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    Adjusted Score: <span style={{ color: '#4f46e5' }}>{adjustedScore}%</span>
                                </label>
                                <input
                                    type="range" min="0" max="100" value={adjustedScore}
                                    onChange={e => setAdjustedScore(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: '#4f46e5' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                    <span>0%</span><span>50%</span><span>100%</span>
                                </div>
                            </div>
                            {/* Feedback Text */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    Expert Feedback <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(required to accept)</span>
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                    placeholder="Write your honest assessment of the candidate's performance, strengths, and areas for improvement..."
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0', fontFamily: 'inherit',
                                        fontSize: '0.9rem', resize: 'vertical', outline: 'none',
                                        color: 'var(--text-main)', lineHeight: 1.6, background: 'var(--bg-app)',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => handleEvaluate('rejected')}
                            disabled={saving}
                            style={{
                                flex: 1, padding: '0.875rem 1.5rem', borderRadius: '14px',
                                border: '2px solid var(--danger)', background: saving ? '#f8fafc' : '#fef2f2',
                                color: 'var(--danger)', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => !saving && (e.currentTarget.style.background = '#fee2e2')}
                            onMouseLeave={e => !saving && (e.currentTarget.style.background = '#fef2f2')}
                        >
                            <XCircle size={18} /> Reject
                        </button>
                        <button
                            onClick={() => handleEvaluate('accepted')}
                            disabled={saving}
                            style={{
                                flex: 1, padding: '0.875rem 1.5rem', borderRadius: '14px',
                                border: 'none', background: saving ? '#6d7ebd' : 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                boxShadow: '0 4px 14px -2px rgba(16,185,129,0.4)', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseLeave={e => !saving && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={18} />}
                            {saving ? 'Saving...' : 'Accept'}
                        </button>
                    </div>
                </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!liveCall ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-app)', borderRadius: '20px', border: '2px dashed var(--border-subtle)' }}>
                                    <Video size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Conduct a Live Interview</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                        Starting a video meeting will notify the candidate on their dashboard to join you for a live technical or behavioral assessment.
                                    </p>
                                    <button 
                                        onClick={startCall}
                                        style={{
                                            padding: '0.8rem 2rem', borderRadius: '12px', border: 'none',
                                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                            color: 'white', fontWeight: 700, cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                                        }}
                                    >
                                        Start Video Meeting
                                    </button>
                                </div>
                            ) : (
                                <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-panel)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></div>
                                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Live Meeting in Progress</span>
                                        </div>
                                        <button 
                                            onClick={stopCall}
                                            style={{
                                                background: '#ef4444', color: 'white', border: 'none',
                                                padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600,
                                                fontSize: '0.8rem', cursor: 'pointer'
                                            }}
                                        >
                                            End Meeting
                                        </button>
                                    </div>
                                    <JitsiMeetComponent roomName={liveCall.roomName} userName={user?.name || 'Expert'} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PendingRequestsSection({ token, toast }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API}/pending-requests`, { headers: { 'x-auth-token': token } });
            setRequests(res.data);
        } catch (err) {
            toast.error('Failed to load pending requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, [token]);

    const handleSave = (decision) => {
        setSelected(null);
        setRequests(prev => prev.filter(r => (r._id || r.id) !== (selected._id || selected.id)));
        // Let parent refresh stats too if needed
    };

    if (loading) return <LoadingSpinner text="Loading pending requests..." />;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pending Requests</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    {requests.length} candidate{requests.length !== 1 ? 's' : ''} awaiting your review.
                </p>
            </div>

            {requests.length === 0 ? (
                <EmptyState icon={<CheckCircle />} title="All caught up!" subtitle="No pending interviews to review right now." />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {requests.map((req) => {
                        const score = req.aiFeedback?.overallScore ?? req.score;
                        const date = req.createdAt || req.date;
                        return (
                            <div key={req._id || req.id} style={{
                                background: 'var(--bg-panel)', borderRadius: '18px', padding: '1.5rem',
                                border: '1px solid var(--border-subtle)', boxShadow: '0 2px 12px -4px rgba(0,0,0,0.08)',
                                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px -6px rgba(0,0,0,0.12)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px -4px rgba(0,0,0,0.08)'; }}
                            >
                                <Avatar name={req.candidateName} avatar={req.candidateAvatar} size={50} />
                                <div style={{ flex: 1, minWidth: '160px' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{req.candidateName}</div>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{req.category}</span>
                                        {date && <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {score != null && <ScorePill score={score} />}
                                    <span style={{
                                        background: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid var(--warning)',
                                        padding: '0.3rem 0.85rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600
                                    }}>Pending</span>
                                    <button
                                        onClick={() => setSelected(req)}
                                        style={{
                                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                            color: 'white', border: 'none', borderRadius: '12px',
                                            padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600,
                                            fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            boxShadow: '0 4px 12px -2px rgba(79,70,229,0.35)', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        View Details <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selected && (
                <InterviewReviewModal
                    interview={selected}
                    token={token}
                    onClose={() => setSelected(null)}
                    onSave={handleSave}
                    toast={toast}
                />
            )}
        </div>
    );
}

// ─── Section 4: Feedback History ──────────────────────────────────────────────
function FeedbackHistorySection({ token, toast }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/feedback-history`, { headers: { 'x-auth-token': token } });
                setHistory(res.data);
            } catch (err) {
                toast.error('Failed to load feedback history.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [token]);

    if (loading) return <LoadingSpinner text="Loading feedback history..." />;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Feedback History</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>All candidates you have reviewed.</p>
            </div>

            {history.length === 0 ? (
                <EmptyState icon={<History />} title="No reviews yet" subtitle="Interviews you review will appear here." />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((item) => {
                        const decision = item.expertReview?.decision;
                        const feedback = item.expertReview?.feedback;
                        const adjustedScore = item.expertReview?.adjustedScore;
                        const reviewedAt = item.expertReview?.reviewedAt;
                        const aiScore = item.aiFeedback?.overallScore ?? item.score;
                        return (
                            <div key={item._id || item.id} style={{
                                background: 'var(--bg-panel)', borderRadius: '18px', padding: '1.5rem',
                                border: `1px solid ${decision === 'accepted' ? '#bbf7d0' : '#fecaca'}`,
                                borderLeft: `4px solid ${decision === 'accepted' ? '#10b981' : '#ef4444'}`,
                                boxShadow: '0 2px 12px -4px rgba(0,0,0,0.08)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px -6px rgba(0,0,0,0.12)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px -4px rgba(0,0,0,0.08)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                    <Avatar name={item.candidateName} avatar={item.candidateAvatar} size={50} />
                                    <div style={{ flex: 1, minWidth: '160px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{item.candidateName}</span>
                                            <span style={{
                                                padding: '0.2rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700,
                                                background: decision === 'accepted' ? '#ecfdf5' : '#fef2f2',
                                                color: decision === 'accepted' ? '#059669' : '#dc2626',
                                                border: `1px solid ${decision === 'accepted' ? '#6ee7b7' : '#fca5a5'}`
                                            }}>
                                                {decision === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.category}</span>
                                            {reviewedAt && <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                                                Reviewed {new Date(reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>AI Score:</span>
                                                {aiScore != null && <ScorePill score={aiScore} small />}
                                            </div>
                                            {adjustedScore != null && adjustedScore !== aiScore && (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Adjusted:</span>
                                                    <ScorePill score={adjustedScore} small />
                                                </div>
                                            )}
                                        </div>
                                        {feedback && (
                                            <p style={{
                                                marginTop: '0.75rem', fontSize: '0.87rem', color: 'var(--text-muted)',
                                                lineHeight: 1.6, background: 'var(--bg-app)', padding: '0.75rem 1rem',
                                                borderRadius: '10px', borderLeft: '3px solid #cbd5e1'
                                            }}>
                                                "{feedback}"
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelected(item)}
                                        style={{
                                            background: 'var(--bg-app)', border: '1px solid var(--border-subtle)',
                                            borderRadius: '10px', padding: '0.5rem 1rem',
                                            fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            transition: 'all 0.2s', flexShrink: 0
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        <FileText size={14} /> Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Details read-only modal */}
            {selected && (
                <InterviewReviewModal
                    interview={selected}
                    token={token}
                    onClose={() => setSelected(null)}
                    onSave={() => setSelected(null)}
                    toast={toast}
                />
            )}
        </div>
    );
}

// ─── Section 5: Profile Settings ─────────────────────────────────────────────
function ProfileSettingsSection({ token, toast, requestData, setRequestData }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', 
        phone: '', 
        location: '',
        domain: '', 
        bio: '', 
        experience: '',
        skills: [],
        previousCompanies: [],
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: ''
    });
    
    const [newSkill, setNewSkill] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileRef = useRef();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Fetch basic user profile
                const profRes = await axios.get(`${API}/profile`, { headers: { 'x-auth-token': token } });
                setProfile(profRes.data);
                if (profRes.data.avatar) setAvatarPreview(profRes.data.avatar.startsWith('/') ? `http://localhost:5002${profRes.data.avatar}` : profRes.data.avatar);

                // Initialize form with both User profile and ExpertRequest data
                setForm({
                    name: profRes.data.name || '',
                    phone: requestData?.phone || '',
                    location: requestData?.location || '',
                    domain: requestData?.domain || profRes.data.field || '',
                    bio: requestData?.bio || profRes.data.bio || '',
                    experience: requestData?.experience || '',
                    skills: requestData?.skills || profRes.data.skills || [],
                    previousCompanies: requestData?.previousCompanies || [],
                    linkedinUrl: requestData?.linkedinUrl || '',
                    githubUrl: requestData?.githubUrl || '',
                    portfolioUrl: requestData?.portfolioUrl || ''
                });
            } catch (err) {
                toast.error('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [token, requestData]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Update User Profile (Name, Bio, Field, Avatar)
            const userFormData = new FormData();
            if (form.name.trim()) userFormData.append('name', form.name.trim());
            if (form.domain.trim()) userFormData.append('field', form.domain.trim());
            userFormData.append('bio', form.bio);
            if (avatarFile) userFormData.append('avatar', avatarFile);

            const userRes = await axios.put(`${API}/profile`, userFormData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
            setProfile(userRes.data.user);

            // 2. Update ExpertRequest Record
            const reqRes = await axios.put(`${API}/my-request`, form, {
                headers: { 'x-auth-token': token }
            });
            setRequestData(reqRes.data.request);

            toast.success('Your profile has been saved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;
        if (form.skills.includes(newSkill.trim())) return;
        setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
        setNewSkill('');
    };

    const removeSkill = (skill) => {
        setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
    };

    const addCompany = () => {
        if (!newCompany.trim()) return;
        if (form.previousCompanies.includes(newCompany.trim())) return;
        setForm(f => ({ ...f, previousCompanies: [...f.previousCompanies, newCompany.trim()] }));
        setNewCompany('');
    };

    const removeCompany = (company) => {
        setForm(f => ({ ...f, previousCompanies: f.previousCompanies.filter(c => c !== company) }));
    };

    // Calculate completion percentage
    const completionWeight = {
        name: 10, phone: 10, location: 10, domain: 10, bio: 20, experience: 10,
        skills: 10, previousCompanies: 10, linkedinUrl: 10
    };
    let completion = 0;
    if (form.name) completion += 10;
    if (form.phone) completion += 10;
    if (form.location) completion += 10;
    if (form.domain) completion += 10;
    if (form.bio.length > 50) completion += 20;
    if (form.experience) completion += 10;
    if (form.skills.length > 0) completion += 10;
    if (form.previousCompanies.length > 0) completion += 10;
    if (form.linkedinUrl) completion += 10;

    if (loading) return <LoadingSpinner text="Loading your data..." />;

    const inputStyle = {
        width: '100%', padding: '0.8rem 1rem', borderRadius: '12px',
        border: '1.5px solid #e2e8f0', fontFamily: 'inherit',
        fontSize: '0.92rem', outline: 'none', color: 'var(--text-main)',
        background: 'var(--bg-app)', transition: 'all 0.2s'
    };

    const sectionStyle = {
        background: 'var(--bg-panel)', borderRadius: '20px', padding: '1.5rem',
        border: '1px solid var(--border-subtle)', marginBottom: '1.5rem',
        boxShadow: '0 2px 10px -4px rgba(0,0,0,0.06)'
    };

    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Expert Profile</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Complete your profile to get verified by our team.</p>
                </div>
                <div style={{ textAlign: 'right', minWidth: '200px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4f46e5', marginBottom: '0.4rem' }}>Profile Completion: {completion}%</div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${completion}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', transition: 'width 0.5s ease' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Left Side: Avatar & Summary */}
                <div style={{ position: 'sticky', top: '100px' }}>
                    <div style={sectionStyle}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }} />
                                ) : (
                                    <Avatar name={form.name} size={110} />
                                )}
                                <button
                                    onClick={() => fileRef.current.click()}
                                    style={{
                                        position: 'absolute', bottom: 0, right: 0,
                                        width: '34px', height: '34px', borderRadius: '50%',
                                        background: '#4f46e5', border: '2px solid white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <Camera size={16} color="white" />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                            </div>
                            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{form.name || 'Your Name'}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{profile?.email}</p>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <MapPin size={16} color="#94a3b8" />
                                <span style={{ color: form.location ? '#1e293b' : '#94a3b8' }}>{form.location || 'Location not set'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <Phone size={16} color="#94a3b8" />
                                <span style={{ color: form.phone ? '#1e293b' : '#94a3b8' }}>{form.phone || 'Phone not set'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <Briefcase size={16} color="#94a3b8" />
                                <span style={{ color: form.domain ? '#1e293b' : '#94a3b8' }}>{form.domain || 'Field not set'}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: '100%', padding: '1rem', borderRadius: '16px', border: 'none',
                            background: saving ? '#818cf8' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            color: 'white', fontWeight: 700, fontSize: '1rem',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            boxShadow: '0 8px 20px -4px rgba(79,70,229,0.4)', transition: 'all 0.2s'
                        }}
                    >
                        {saving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>

                {/* Right Side: Detailed Forms */}
                <div>
                    <div style={sectionStyle}>
                        <h4 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={18} color="#4f46e5" /> Personal Information
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Full Name</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="John Doe" />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="+1 234 567 890" />
                            </div>
                            <div>
                                <label style={labelStyle}>Location</label>
                                <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={inputStyle} placeholder="New York, USA" />
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h4 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={18} color="#4f46e5" /> Professional Details
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Primary Domain</label>
                                    <input type="text" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} style={inputStyle} placeholder="e.g. Senior Software Engineer" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Years of Experience</label>
                                    <input type="text" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} style={inputStyle} placeholder="e.g. 5+ years" />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Detailed Bio</label>
                                <textarea 
                                    value={form.bio} 
                                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} 
                                    style={{ ...inputStyle, resize: 'vertical' }} 
                                    rows={4} 
                                    placeholder="Write a professional summary of your career and key achievements..."
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: form.bio.length < 50 ? '#ef4444' : '#94a3b8', marginTop: '0.3rem' }}>
                                    {form.bio.length}/300 characters (Min 50 for better verification)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h4 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Star size={18} color="#4f46e5" /> Skills & Companies
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Technical Skills</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input 
                                        type="text" value={newSkill} 
                                        onChange={e => setNewSkill(e.target.value)} 
                                        onKeyPress={e => e.key === 'Enter' && addSkill()}
                                        style={inputStyle} placeholder="Add a skill (e.g. React, Node.js)" 
                                    />
                                    <button onClick={addSkill} style={{ padding: '0 1.25rem', background: 'var(--neutral-soft)', border: '1.5px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}><Plus size={18}/></button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {form.skills.map(s => (
                                        <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {s} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)} />
                                        </span>
                                    ))}
                                    {form.skills.length === 0 && <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>No skills added.</span>}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Previous Companies</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input 
                                        type="text" value={newCompany} 
                                        onChange={e => setNewCompany(e.target.value)} 
                                        onKeyPress={e => e.key === 'Enter' && addCompany()}
                                        style={inputStyle} placeholder="Add company (e.g. Google, Meta)" 
                                    />
                                    <button onClick={addCompany} style={{ padding: '0 1.25rem', background: 'var(--neutral-soft)', border: '1.5px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}><Plus size={18}/></button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {form.previousCompanies.map(c => (
                                        <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: 'var(--success-soft)', color: '#16a34a', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {c} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeCompany(c)} />
                                        </span>
                                    ))}
                                    {form.previousCompanies.length === 0 && <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>No companies added.</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h4 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Globe size={18} color="#4f46e5" /> Professional Links
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Linkedin size={20} color="white" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input type="text" value={form.linkedinUrl} onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} style={inputStyle} placeholder="linkedin.com/in/username" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#24292e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Github size={20} color="white" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input type="text" value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} style={inputStyle} placeholder="github.com/username" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ExternalLink size={20} color="white" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input type="text" value={form.portfolioUrl} onChange={e => setForm(f => ({ ...f, portfolioUrl: e.target.value }))} style={inputStyle} placeholder="portfolio-website.com" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocumentsSection({ token, toast, requestData, setRequestData }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef();

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        if (!requestData || requestData.status === 'new') {
            toast.error('Please fill and save your personal profile before uploading documents.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));

        try {
            const res = await axios.post(`${API}/my-request/upload`, formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
            setRequestData(prev => ({ ...prev, documents: res.data.documents }));
            toast.success('Documents uploaded successfully.');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Upload failed.');
        } finally {
            setUploading(false);
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (docUrl) => {
        const filename = docUrl.split('/').pop();
        try {
            const res = await axios.delete(`${API}/my-request/documents/${filename}`, {
                headers: { 'x-auth-token': token }
            });
            setRequestData(prev => ({ ...prev, documents: res.data.documents }));
            toast.info('Document deleted.');
        } catch (err) {
            toast.error('Failed to delete document.');
        }
    };

    const documents = requestData?.documents || [];

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verification Documents</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Upload your CV, certificates, or portfolio to help us verify your expertise.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 2fr', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Upload Card */}
                <div style={{ background: 'var(--bg-panel)', border: '2px dashed var(--border-subtle)', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--bg-app)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <FileText size={32} color="#4f46e5" />
                    </div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Upload PDF or Image</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Drag and drop your files here, or click the button below to browse.</p>
                    
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#4f46e5', color: 'white',
                            border: 'none', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto'
                        }}
                    >
                        {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
                        {uploading ? 'Uploading...' : 'Browse Files'}
                    </button>
                    <input type="file" ref={fileInputRef} multiple onChange={handleUpload} style={{ display: 'none' }} accept=".pdf,image/*" />
                    <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>Supported: PDF, JPG, PNG (Max 10MB per file)</p>
                </div>

                {/* File List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        Uploaded Files ({documents.length})
                    </h4>
                    
                    {documents.length === 0 ? (
                        <div style={{ padding: '3rem', background: 'var(--bg-app)', borderRadius: '20px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                            <FileText size={32} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>No documents uploaded yet.</div>
                        </div>
                    ) : (
                        documents.map((doc, idx) => {
                            const filename = doc.split('/').pop();
                            const isPdf = filename.toLowerCase().endsWith('.pdf');
                            return (
                                <div key={idx} style={{
                                    background: 'var(--bg-panel)', borderRadius: '16px', padding: '1rem 1.25rem',
                                    border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem',
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isPdf ? '#fef2f2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={20} color={isPdf ? '#ef4444' : '#3b82f6'} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{filename}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Added {new Date().toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <a 
                                            href={`http://localhost:5002${doc}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--text-muted)', transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(doc)}
                                            style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

function VideoVerificationSection({ requestData, currentTime, toast, token, meetingLink, meetingDateTime }) {
    if (!requestData || requestData.status === 'new') {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
                <Video size={48} color="#94a3b8" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Start Your Application First</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>You need to complete and save your Profile before we can schedule a video verification meeting.</p>
            </div>
        );
    }

    const { meetingStatus } = requestData;
    const isScheduled = meetingStatus === 'scheduled';
    const isCompleted = meetingStatus === 'completed';
    // Prioritize passed meetingDateTime, fallback to requestData
    const finalMeetingDateTime = meetingDateTime || requestData.meetingDateTime;
    const dateObj = finalMeetingDateTime ? new Date(finalMeetingDateTime) : null;

    let joinStatus = 'not_available';
    if (isScheduled && dateObj) {
        const startTime = dateObj.getTime();
        const now = currentTime.getTime();
        const oneHourAfter = startTime + 60 * 60000;

        if (now < startTime) joinStatus = 'soon';
        else if (now >= startTime && now <= oneHourAfter) joinStatus = 'available';
        else joinStatus = 'expired';
    }

    const handleJoinClick = () => {
        if (!meetingLink) {
            toast.error("Meeting link not found. Please contact support.");
            return;
        }

        const now = currentTime.getTime();
        const startTime = dateObj ? dateObj.getTime() : 0;

        if (now >= startTime) { 
            let url = meetingLink;
            if (!url.startsWith('http')) url = `https://meet.google.com/${url}`;
            window.open(url, '_blank');
        } else {
            toast.error("Meeting has not started yet.");
        }
    };

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Video Verification</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>We verify every expert through a brief video call to ensure the highest quality for our candidates.</p>
            </div>

            <div style={{ background: 'var(--bg-panel)', borderRadius: '24px', padding: '2.5rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '56px', height: '56px', borderRadius: '16px', 
                            background: isCompleted ? '#f0fdf4' : isScheduled ? '#eff6ff' : '#f8fafc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Video size={28} color={isCompleted ? '#16a34a' : isScheduled ? '#3b82f6' : '#94a3b8'} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meeting Status</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isCompleted ? 'Completed' : isScheduled ? 'Scheduled' : 'Not Yet Scheduled'}
                                {isCompleted && <CheckCircle size={20} color="#16a34a" />}
                                {isScheduled && <Clock size={20} color="#3b82f6" />}
                            </div>
                        </div>
                    </div>

                    {isScheduled && dateObj && (
                        <div style={{ background: 'var(--bg-app)', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Scheduled For</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--neutral-soft)', borderRadius: '16px', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Info size={20} color="#475569" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>How it works</div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                Our administrator will review your profile and documents. If everything looks good, they will schedule a 10-15 minute video call to discuss your expertise and interview style. 
                                <strong> Admin will verify your profile through this call.</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {!isScheduled && !isCompleted && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Your application is currently being reviewed. We'll notify you here once a meeting is scheduled.
                        </div>
                    </div>
                )}

                {isScheduled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        {joinStatus === 'available' ? (
                            <button 
                                onClick={handleJoinClick}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    color: 'white', 
                                    padding: '1rem 2.5rem', borderRadius: '16px',
                                    textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                                    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                                    transition: 'all 0.2s',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Video size={20} /> Join Google Meet
                            </button>
                        ) : joinStatus === 'soon' ? (
                            <div style={{ padding: '0.75rem 1.5rem', background: 'var(--warning-soft)', color: 'var(--warning)', borderRadius: '12px', border: '1px solid #fef3c7', fontWeight: 600, fontSize: '0.9rem' }}>
                                <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Meeting not started yet
                            </div>
                        ) : (
                            <div style={{ padding: '0.75rem 1.5rem', background: 'var(--danger-soft)', color: 'var(--danger)', borderRadius: '12px', border: '1px solid var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}>
                                <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Meeting expired
                            </div>
                        )}
                        
                        <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', textAlign: 'center', maxWidth: '300px' }}>
                            {joinStatus === 'available' ? 'Meeting is live! Click above to join the Google Meet session.' : 
                             joinStatus === 'soon' ? 'The join button will appear automatically at the scheduled meeting time.' : 
                             'This meeting link is no longer active.'}
                        </p>
                    </div>
                )}

                {isCompleted && (
                    <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #bbf7d0', borderRadius: '20px', background: 'var(--success-soft)' }}>
                        <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '1rem', margin: 0 }}>
                            Meeting completed! Our team is now making a final decision. You'll see an update on your dashboard soon.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function JitsiMeetComponent({ roomName, userName }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!roomName || !window.JitsiMeetExternalAPI) return;

        const domain = 'meet.jit.si';
        const options = {
            roomName: roomName,
            width: '100%',
            height: 500,
            parentNode: containerRef.current,
            userInfo: {
                displayName: userName
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false
            }
        };
        const api = new window.JitsiMeetExternalAPI(domain, options);

        return () => api.dispose();
    }, [roomName]);

    return <div ref={containerRef} style={{ height: '500px', background: '#000' }} />;
}
const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, expertOnly: true },
    { id: 'pending', label: 'Pending Requests', icon: Clock, expertOnly: true },
    { id: 'history', label: 'Feedback History', icon: History, expertOnly: true },
    { id: 'profile', label: 'Expert Profile', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'video_verification', label: 'Video Verification', icon: Video },
];

export function ExpertDashboard({ user }) {
    const isExpert = user?.role === 'expert' || user?.role === 'admin';
    const [activeTab, setActiveTab] = useState(isExpert ? 'overview' : 'profile');
    const [requestData, setRequestData] = useState(null);
    const [meetingLink, setMeetingLink] = useState('');
    const [meetingDateTime, setMeetingDateTime] = useState(null);
    const [loadingRequest, setLoadingRequest] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const toast = useToast();
    const { logout } = useAuth();
    const token = localStorage.getItem('auth-token');
    const firstName = user?.name ? user.name.split(' ')[0] : 'Expert';

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            toast.info("Logging out safely...");
            setTimeout(() => {
                logout();
            }, 800);
        }
    };

    useEffect(() => {
        const fetchMyRequest = async () => {
            try {
                const res = await axios.get(`${API}/my-request`, { headers: { 'x-auth-token': token } });
                setRequestData(res.data);

                // Fetch direct meeting data using userId as expertId
                if (user?._id || user?.id) {
                    const userId = user._id || user.id;
                    try {
                        // Correctly reaches /api/meeting/:expertId because of the /api mount in index.js
                        const mRes = await axios.get(`http://localhost:5002/api/meeting/${userId}`);
                        setMeetingLink(mRes.data.meetingLink);
                        setMeetingDateTime(mRes.data.meetingDateTime);
                    } catch (mErr) {
                        console.error("Could not fetch meeting link explicitly", mErr);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch expert request", err);
            } finally {
                setLoadingRequest(false);
            }
        };
        fetchMyRequest();

        const timer = setInterval(() => setCurrentTime(new Date()), 5000);
        return () => clearInterval(timer);
    }, [token]);

    // Inject keyframe animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-app)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Top Header */}
            <div style={{
                background: 'var(--bg-panel)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '1.25rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 8px -2px rgba(0,0,0,0.08)',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        Expert Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', margin: 0, marginTop: '1px' }}>
                        Welcome back, <strong style={{ color: '#4f46e5' }}>{firstName}</strong> 👋
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        background: 'var(--success-soft)', color: '#16a34a',
                        border: '1px solid var(--success)',
                        padding: '0.4rem 1rem', borderRadius: '99px',
                        fontSize: '0.82rem', fontWeight: 600,
                    }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                        Expert
                    </div>
                    <ThemeToggle />
                    <Avatar name={user?.name || ''} avatar={user?.avatar || ''} size={38} />
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-app)', border: '1px solid var(--border-subtle)',
                            color: 'var(--danger)', padding: '0.55rem', borderRadius: '10px',
                            cursor: 'pointer', transition: 'all 0.2s', marginLeft: '0.5rem'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-soft)'; e.currentTarget.style.color = '#dc2626'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--danger)'; }}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
                background: 'var(--bg-panel)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '0 2rem',
                display: 'flex',
                gap: '0',
                overflowX: 'auto',
            }}>
                {TABS.filter(t => !t.expertOnly || isExpert).map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '1rem 1.25rem',
                                border: 'none', borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
                                background: 'none', cursor: 'pointer',
                                color: isActive ? '#4f46e5' : '#64748b',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.9rem', whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.borderBottomColor = isActive ? '#4f46e5' : '#c4b5fd'; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderBottomColor = isActive ? '#4f46e5' : 'transparent'; }}
                        >
                            <Icon size={17} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Application Status Banner */}
            {!isExpert && requestData && requestData.status !== 'new' && (
                <div style={{ padding: '1rem 2rem 0' }}>
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        background: requestData.status === 'rejected' ? '#fef2f2' : requestData.status === 'accepted' ? '#f0fdf4' : '#eff6ff',
                        border: `1px solid ${requestData.status === 'rejected' ? '#fecaca' : requestData.status === 'accepted' ? '#bbf7d0' : '#bfdbfe'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {requestData.status === 'rejected' ? <XCircle size={20} color="#ef4444" /> :
                             requestData.status === 'accepted' ? <CheckCircle size={20} color="#10b981" /> :
                             <Clock size={20} color="#3b82f6" />}
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                    Status: {requestData.status === 'under_review' ? 'Under Review' : requestData.status.charAt(0).toUpperCase() + requestData.status.slice(1)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {requestData.status === 'pending' && 'Your application is waiting for initial review.'}
                                    {requestData.status === 'under_review' && 'An administrator is currently evaluating your profile.'}
                                    {requestData.status === 'rejected' && `Reason: ${requestData.rejectionReason || 'No reason provided.'}`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div style={{ flex: 1, padding: '2rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
                <div key={activeTab} style={{ animation: 'fadeIn 0.3s ease' }}>
                    {activeTab === 'overview' && <OverviewSection token={token} />}
                    {activeTab === 'pending' && <PendingRequestsSection token={token} toast={toast} />}
                    {activeTab === 'history' && <FeedbackHistorySection token={token} toast={toast} />}
                    {activeTab === 'profile' && <ProfileSettingsSection token={token} toast={toast} requestData={requestData} setRequestData={setRequestData} />}
                    {activeTab === 'documents' && <DocumentsSection token={token} toast={toast} requestData={requestData} setRequestData={setRequestData} />}
                    {activeTab === 'video_verification' && (
                        <VideoVerificationSection 
                            requestData={requestData} 
                            currentTime={currentTime} 
                            toast={toast} 
                            token={token}
                            meetingLink={meetingLink}
                            meetingDateTime={meetingDateTime}
                        />
                    )}
                </div>
            </div>

            <Toast toasts={toast.toasts} removeToast={toast.remove} />
        </div>
    );
}
