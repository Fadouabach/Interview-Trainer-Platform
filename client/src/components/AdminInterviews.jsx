import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Calendar, Clock, BarChart2 } from 'lucide-react';

export function AdminInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInterviews = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.get('http://localhost:5002/api/admin/interviews', {
                headers: { 'x-auth-token': token }
            });
            setInterviews(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this interview session? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('auth-token');
            await axios.delete(`http://localhost:5002/api/admin/interviews/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setInterviews(interviews.filter(i => (i._id || i.id) !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete interview");
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Interviews...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Interview Sessions</h1>
                <p style={{ color: 'var(--text-muted)' }}>Monitor and manage all practice sessions.</p>
            </header>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {interviews.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No interview sessions recorded yet.
                    </div>
                ) : (
                    interviews.map(session => (
                        <div key={session._id || session.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BarChart2 size={18} color="var(--primary)" />
                                    {session.category || 'General Interview'}
                                </h3>
                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={14} />
                                        {new Date(session.createdAt).toLocaleDateString()}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={14} />
                                        {Math.floor(session.duration / 60)} min
                                    </span>
                                    <span style={{ fontWeight: '600', color: session.score > 70 ? '#10b981' : '#f59e0b' }}>
                                        Score: {session.score}%
                                    </span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleDelete(session._id || session.id)} 
                                style={{ padding: '0.5rem', background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
