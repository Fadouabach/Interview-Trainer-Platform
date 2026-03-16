import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BarChart2, Shield, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminOverview({ user }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await axios.get('http://localhost:5002/api/admin/stats', {
                    headers: { 'x-auth-token': token }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) return <div style={{ padding: '2rem' }}>Loading Overview...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Platform high-level metrics and growth.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard icon={<Users color="white" />} label="Total Users" value={stats.totalUsers} color="var(--primary)" />
                <StatCard icon={<Shield color="white" />} label="Total Experts" value={stats.totalExperts} color="#10b981" />
                <StatCard icon={<BarChart2 color="white" />} label="Total Interviews" value={stats.totalInterviews} color="#f59e0b" />
                <StatCard icon={<Activity color="white" />} label="Avg Success Score" value={`${stats.successRate}/100`} color="#6366f1" />
            </div>

            <div className="card" style={{ height: '400px' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>User Growth</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                        <Tooltip />
                        <Area type="monotone" dataKey="users" stroke="var(--primary)" fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                </ResponsiveContainer>
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
