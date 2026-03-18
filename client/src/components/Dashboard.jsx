import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, TrendingUp, Clock, Calendar, Video, XCircle, Shield, CheckCircle } from 'lucide-react';

export function Dashboard({ onStartPractice, user }) {
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [videoCallConfig, setVideoCallConfig] = useState(null);
    
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`http://localhost:5002/api/dashboard/${user.id}`);
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchStats();
    }, [user]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '4rem' }}>
                <div className="pulse" style={{ color: 'var(--primary)', fontWeight: '600' }}>Loading your progress...</div>
            </div>
        );
    }

    const dashboardData = stats || {
        interviewsCompleted: 0,
        practiceTime: '0h 0m',
        avgScore: '0%',
        readinessScore: '0%',
        recentActivity: [],
        expertRequestStatus: null,
        expertRequestId: null
    };

    const openVideoCall = (type, id, room) => {
        setVideoCallConfig({ type, id, room });
        setShowVideoCall(true);
    };

    const VideoCallModal = ({ config, onClose }) => {
        const jitsiContainerRef = useRef(null);

        useEffect(() => {
            if (!config || !window.JitsiMeetExternalAPI) return;

            const domain = 'meet.jit.si';
            const roomName = config.type === 'verification' 
                ? `Confido_Verification_${config.id}`
                : config.room;

            const options = {
                roomName: roomName,
                width: '100%',
                height: 500,
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: user.name || 'Candidate'
                },
                interfaceConfigOverwrite: {
                    TILE_VIEW_MAX_COLUMNS: 2
                }
            };
            const api = new window.JitsiMeetExternalAPI(domain, options);

            return () => api.dispose();
        }, [config]);

        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000, padding: '1rem'
            }}>
                <div style={{
                    background: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '900px',
                    overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ padding: '1.25rem 1.5rem', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Video size={20} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{config?.type === 'verification' ? 'Expert Verification Call' : 'Expert Interview Session'}</h3>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <XCircle size={24} />
                        </button>
                    </div>
                    <div ref={jitsiContainerRef} style={{ background: '#000', height: '500px' }} />
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back, {firstName}!</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Ready to ace your next interview?</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontWeight: '600' }}>{user?.name}</div>
                    </div>

                </div>
            </header>

            {/* Expert Verification Banner */}
            {dashboardData.expertRequestStatus === 'under_review' && (
                <div style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    borderRadius: '1.25rem', padding: '1.5rem 2rem', marginBottom: '2.5rem',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 10px 25px -5px rgba(79,70,229,0.4)',
                    animation: 'pulse-subtle 2s infinite ease-in-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '1rem',
                            background: 'rgba(255,255,255,0.2)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Video size={28} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>Verification Interview in Progress</h3>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>An administrator is waiting to verify your expert profile.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => openVideoCall('verification', dashboardData.expertRequestId)}
                        className="btn"
                        style={{
                            background: 'white', color: '#4f46e5',
                            padding: '0.8rem 1.75rem', fontWeight: 700,
                            borderRadius: '0.75rem', border: 'none'
                        }}
                    >
                        Join Video Call
                    </button>
                </div>
            )}

            {/* Live Interview Session Call Banner */}
            {dashboardData.activeInterviewCall && (
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '1.25rem', padding: '1.5rem 2rem', marginBottom: '2.5rem',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 10px 25px -5px rgba(16,185,129,0.4)',
                    animation: 'pulse-subtle 2s infinite ease-in-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '1rem',
                            background: 'rgba(255,255,255,0.2)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Video size={28} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>Expert Interview in Progress</h3>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>An expert is waiting for you in a live video session.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => openVideoCall('interview', dashboardData.activeInterviewCall.sessionId, dashboardData.activeInterviewCall.roomName)}
                        className="btn"
                        style={{
                            background: 'white', color: '#059669',
                            padding: '0.8rem 1.75rem', fontWeight: 700,
                            borderRadius: '0.75rem', border: 'none'
                        }}
                    >
                        Join Interview
                    </button>
                </div>
            )}

            {dashboardData.expertRequestStatus === 'pending' && (
                <div style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: '1.25rem', padding: '1.25rem 2rem', marginBottom: '2.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem'
                }}>
                    <Shield size={20} color="#64748b" />
                    <span style={{ fontSize: '0.95rem', color: '#64748b' }}>
                        Your expert application is **Pending Review**. We will notify you when an interview is scheduled.
                    </span>
                </div>
            )}

            {showVideoCall && <VideoCallModal config={videoCallConfig} onClose={() => setShowVideoCall(false)} />}

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    icon={<TrendingUp color="white" />}
                    label="Avg. Score"
                    value={dashboardData.avgScore}
                    trend={dashboardData.interviewsCompleted > 0 ? "Live data" : "No sessions yet"}
                    color="var(--primary)"
                />
                <StatCard
                    icon={<Clock color="white" />}
                    label="Practice Time"
                    value={dashboardData.practiceTime}
                    trend="Lifetime"
                    color="#10b981"
                />
                <StatCard
                    icon={<Play color="white" />}
                    label="Interviews"
                    value={dashboardData.interviewsCompleted.toString()}
                    trend="Completed"
                    color="#f59e0b"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Action Area */}
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-panel), #f0f7ff)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Start Practice Session</h2>
                            <p style={{ maxWidth: '400px', marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                Simulate a real interview environment with AI-powered feedback.
                                Choose from Frontend, Backend, or Behavioral questions.
                            </p>
                            <button className="btn" onClick={onStartPractice} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                                <Play size={20} fill="currentColor" />
                                Start New Interview
                            </button>
                        </div>
                        <div style={{
                            width: '180px', height: '180px',
                            background: 'white', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 20px 40px rgba(14, 165, 233, 0.15)'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{dashboardData.readinessScore}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Readiness</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {dashboardData.recentActivity.length > 0 ? (
                            dashboardData.recentActivity.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    paddingBottom: '1rem', borderBottom: idx < dashboardData.recentActivity.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '500' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{
                                        background: item.score?.includes('Pending') ? '#f1f5f9' : '#dcfce7',
                                        color: item.score?.includes('Pending') ? '#64748b' : '#166534',
                                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '500'
                                    }}>
                                        {item.score}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No activity yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend, color }) {
    return (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 16px -4px ${color}80`
            }}>
                {React.cloneElement(icon, { size: 28 })}
            </div>
            <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.2' }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '500' }}>{trend}</div>
            </div>
        </div>
    );
}
