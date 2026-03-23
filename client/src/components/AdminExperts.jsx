import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Shield, Trash2, CheckCircle, XCircle, User, Linkedin, Github, Globe, Search } from 'lucide-react';

export function AdminExperts() {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredExperts = experts.filter(e => 
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={28} /> Expert Directory
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage platform experts and their privileges.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search experts, skills, or companies..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                padding: '0.6rem 1rem 0.6rem 2.5rem', 
                                borderRadius: '10px', 
                                border: '1px solid var(--border-subtle)', 
                                width: '320px',
                                fontSize: '0.9rem'
                            }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    </div>
                </div>
            </header>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                Showing <strong>{filteredExperts.length}</strong> {filteredExperts.length === 1 ? 'expert' : 'experts'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {filteredExperts.map(e => (
                    <div key={e._id || e.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--neutral-soft)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {e.avatar ? <img src={e.avatar} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="#94a3b8" />}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{e.name}</h2>
                                    <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{e.title || e.field || 'Expert'} @ {e.company || 'Platform'}</p>
                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} fill="#fbbf24" color="#fbbf24" /> {e.rating || '0'} ({e.reviewsCount || '0'} sessions)</span>
                                        <span>•</span>
                                        <span>{e.location || 'Remote'}</span>
                                        <span>•</span>
                                        <span>{e.experience || 'Not specified'} exp</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>${e.price || '50'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per session</div>
                                <button onClick={() => handleDelete(e._id || e.id)} style={{ marginTop: '1rem', background: 'var(--danger-soft)', border: 'none', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>
                                    <XCircle size={16} /> Demote Expert
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '700' }}>About</h3>
                                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>{e.bio || 'No biography provided.'}</p>
                                
                                <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.75rem', fontWeight: '700' }}>Skills & Expertise</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {(e.skills || []).map((s, idx) => (
                                        <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>{s}</span>
                                    ))}
                                    {(!e.skills || e.skills.length === 0) && <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>No skills listed</span>}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '700' }}>Professional Links</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <a href={e.linkedinUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: e.linkedinUrl ? '#1d4ed8' : '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                                        <Linkedin size={16} /> LinkedIn Profile
                                    </a>
                                    <a href={e.githubUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: e.githubUrl ? '#334155' : '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                                        <Github size={16} /> GitHub Portfolio
                                    </a>
                                    <a href={e.portfolioUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: e.portfolioUrl ? '#7c3aed' : '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                                        <Globe size={16} /> Website / Portfolio
                                    </a>
                                </div>
                                <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Contact Email</div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{e.email}</div>
                                    {e.phone && (
                                        <>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.25rem' }}>Phone Number</div>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{e.phone}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredExperts.length === 0 && (
                    <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                        <h3>{searchTerm ? "No experts match your search." : "No experts featured on the platform right now."}</h3>
                        <p>{searchTerm ? "Try adjusting your filters or search term." : "Approved experts from the verification system will appear here."}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
