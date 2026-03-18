import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart2, Settings, Shield } from 'lucide-react';

export function AdminDashboard({ user }) {
    const navigate = useNavigate();
    const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {firstName}. Here is your platform overview.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard icon={<Users color="white" />} label="Total Users" value="1,245" color="var(--primary)" />
                <StatCard icon={<Shield color="white" />} label="Active Experts" value="42" color="#10b981" />
                <StatCard icon={<BarChart2 color="white" />} label="Total Sessions" value="8,930" color="#f59e0b" />
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Management Tools</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn" onClick={() => navigate('/admin/users')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} /> Manage Users
                    </button>
                    <button className="btn" onClick={() => navigate('/admin/expert-requests')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981' }}>
                        <Shield size={18} /> Manage Experts
                    </button>
                    <button className="btn" onClick={() => navigate('/admin/settings')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#64748b' }}>
                        <Settings size={18} /> Platform Settings
                    </button>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent System Activity</h3>
                <p style={{ color: 'var(--text-muted)' }}>No recent activity to display.</p>
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
