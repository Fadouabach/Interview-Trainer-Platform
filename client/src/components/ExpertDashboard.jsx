import React from 'react';
import { Calendar, MessageSquare, Star, Clock } from 'lucide-react';

export function ExpertDashboard({ user }) {
    const firstName = user?.name ? user.name.split(' ')[0] : 'Expert';

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Expert Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {firstName}. Manage your sessions and feedback.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard icon={<Calendar color="white" />} label="Upcoming Sessions" value="3" color="var(--primary)" />
                <StatCard icon={<MessageSquare color="white" />} label="Pending Feedback" value="5" color="#f59e0b" />
                <StatCard icon={<Star color="white" />} label="Average Rating" value="4.9" color="#10b981" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} color="var(--primary)" /> 
                        Upcoming Sessions
                    </h3>
                    <p style={{ color: 'var(--text-muted)' }}>You have 3 upcoming sessions this week.</p>
                    <button className="btn" style={{ marginTop: '1rem', width: '100%' }}>View Schedule</button>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={20} color="#f59e0b" /> 
                        Feedback Required
                    </h3>
                    <p style={{ color: 'var(--text-muted)' }}>You have 5 past sessions awaiting your feedback.</p>
                    <button className="btn" style={{ marginTop: '1rem', width: '100%', background: '#f59e0b' }}>Provide Feedback</button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
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
            </div>
        </div>
    );
}
