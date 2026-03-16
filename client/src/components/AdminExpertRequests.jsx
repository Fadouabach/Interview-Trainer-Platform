import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, Check, X, Mail, Briefcase, Info, Phone, MapPin, 
    Linkedin, Github, ExternalLink, FileText, Download, Building,
    ChevronDown, ChevronUp
} from 'lucide-react';

export function AdminExpertRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [expandedIds, setExpandedIds] = useState(new Set());

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.get('http://localhost:5002/api/admin/expert-requests', {
                headers: { 'x-auth-token': token }
            });
            setRequests(res.data);
        } catch (err) {
            console.error("Failed to fetch expert requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const toggleExpand = (id) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('auth-token');
            await axios.put(`http://localhost:5002/api/admin/approve-expert/${id}`, {}, {
                headers: { 'x-auth-token': token }
            });
            setRequests(requests.filter(r => (r._id || r.id) !== id));
            showNotification("Expert approved successfully!", "success");
        } catch (err) {
            console.error("Approval failed", err);
            showNotification("Failed to approve expert", "error");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;
        try {
            const token = localStorage.getItem('auth-token');
            await axios.put(`http://localhost:5002/api/admin/reject-expert/${id}`, {}, {
                headers: { 'x-auth-token': token }
            });
            setRequests(requests.filter(r => (r._id || r.id) !== id));
            showNotification("Expert request rejected", "info");
        } catch (err) {
            console.error("Rejection failed", err);
            showNotification("Failed to reject expert", "error");
        }
    };

    const showNotification = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Expert Requests...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Expert Verification</h1>
                <p style={{ color: 'var(--text-muted)' }}>Review detailed applications for expert status.</p>
            </header>

            {message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? '#dcfce7' : message.type === 'error' ? '#fee2e2' : '#e0f2fe',
                    color: message.type === 'success' ? '#166534' : message.type === 'error' ? '#991b1b' : '#075985',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : message.type === 'error' ? '#fecaca' : '#bae6fd'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {message.type === 'success' ? <Check size={18} /> : message.type === 'error' ? <X size={18} /> : <Info size={18} />}
                    {message.text}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {requests.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '5rem 3rem', color: 'var(--text-muted)' }}>
                        <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No pending expert requests found.</p>
                    </div>
                ) : (
                    requests.map(req => {
                        const id = req._id || req.id;
                        const isExpanded = expandedIds.has(id);
                        
                        return (
                            <div key={id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Main Header Bar */}
                                <div style={{ 
                                    padding: '1.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
                                    cursor: 'pointer'
                                }} onClick={() => toggleExpand(id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '50%',
                                            backgroundColor: 'var(--bg-app)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--primary)', border: '1px solid var(--border-subtle)'
                                        }}>
                                            <User size={28} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{req.name}</h3>
                                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14} /> {req.email}</span>
                                                {req.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {req.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Domain</div>
                                            <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{req.domain}</div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={24} color="var(--text-muted)" /> : <ChevronDown size={24} color="var(--text-muted)" />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem', background: '#fafafa' }}>
                                        {/* Left Column: Details */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {/* Profile & Socials */}
                                            <section>
                                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Info size={16} /> Contact & Social Links
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                                    {req.phone && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                                            <Phone size={16} color="var(--primary)" /> {req.phone}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        {req.linkedinUrl && (
                                                            <a href={req.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.5rem 1rem', background: '#0077b5', color: 'white', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                                <Linkedin size={16} /> LinkedIn
                                                            </a>
                                                        )}
                                                        {req.githubUrl && (
                                                            <a href={req.githubUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                                <Github size={16} /> GitHub
                                                            </a>
                                                        )}
                                                        {req.portfolioUrl && (
                                                            <a href={req.portfolioUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                                <ExternalLink size={16} /> Portfolio
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Experience & Skills */}
                                            <section>
                                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Briefcase size={16} /> Experience & Skills
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Professional Summary</div>
                                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                                            {req.bio}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.6rem' }}>Skills</div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                                {req.skills && req.skills.map(skill => (
                                                                    <span key={skill} style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{skill}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.6rem' }}>Companies</div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                                                {req.previousCompanies && req.previousCompanies.map(company => (
                                                                    <span key={company} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                                        <Building size={14} /> {company}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>

                                        {/* Right Column: Documents & Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {/* Documents */}
                                            <section>
                                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FileText size={16} /> Documents
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {req.documents && req.documents.map((doc, idx) => (
                                                        <div key={idx} style={{ 
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                                            padding: '0.75rem 1rem', background: 'white', borderRadius: '8px', 
                                                            border: '1px solid var(--border-subtle)' 
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <FileText size={18} color="var(--primary)" />
                                                                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{doc.split('/').pop()}</span>
                                                            </div>
                                                            <a href={doc} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                                                                <ExternalLink size={18} />
                                                            </a>
                                                        </div>
                                                    ))}
                                                    {(!req.documents || req.documents.length === 0) && (
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No documents uploaded.</div>
                                                    )}
                                                </div>
                                            </section>

                                            {/* Final Actions */}
                                            <section style={{ marginTop: 'auto', background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>Verdict</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    <button
                                                        onClick={() => handleApprove(id)}
                                                        className="btn"
                                                        style={{ width: '100%', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '48px' }}
                                                    >
                                                        <Check size={20} /> Approve Application
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(id)}
                                                        className="btn"
                                                        style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '48px' }}
                                                    >
                                                        <X size={20} /> Reject Application
                                                    </button>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
