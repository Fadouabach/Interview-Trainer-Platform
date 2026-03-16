import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';

export function AdminExperts() {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExperts = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.get('http://localhost:5002/api/admin/experts', {
                headers: { 'x-auth-token': token }
            });
            setExperts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this expert's status? They will be downgraded to a normal user.")) return;
        try {
            const token = localStorage.getItem('auth-token');
            // We use the same update role endpoint to demote them
            await axios.put(`http://localhost:5002/api/admin/users/${id}/role`, { role: 'user' }, {
                headers: { 'x-auth-token': token }
            });
            setExperts(experts.filter(e => (e._id || e.id) !== id));
        } catch (err) {
            console.error("Demotion failed", err);
            alert("Failed to update expert status");
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Experts...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={28} /> Expert Directory
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage platform experts and their privileges.</p>
                </div>
                <button className="btn" style={{ background: '#10b981' }}>+ Invite Expert</button>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Professional</th>
                            <th style={{ padding: '1rem' }}>Title & Company</th>
                            <th style={{ padding: '1rem' }}>Rating</th>
                            <th style={{ padding: '1rem' }}>Price/Session</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {experts.map(e => (
                            <tr key={e._id || e.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '500' }}>{e.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div>{e.title || 'Senior Engineer'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.company || 'Tech Corp'}</div>
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: '600' }}>
                                    <Star size={16} fill="currentColor" />
                                    {e.rating || '4.9'} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.85rem' }}>({e.reviewsCount || 12})</span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    ${e.price || 50} / hr
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => handleDelete(e._id || e.id)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <XCircle size={16} /> Demote
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {experts.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No experts feature on the platform right now.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
