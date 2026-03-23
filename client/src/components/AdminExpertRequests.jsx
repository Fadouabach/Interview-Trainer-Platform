import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, Check, X, Mail, Briefcase, Info, Linkedin, Github, 
    ExternalLink, FileText, Download, Building, Shield, Clock, 
    AlertCircle, Search, MessageSquare, Award, Save, Trash2, 
    Eye, Sparkles, Globe, Video, XCircle, MapPin, Phone, CheckCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:5002/api/admin';

export function AdminExpertRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Scheduling State
    const [schedulingDate, setSchedulingDate] = useState('');
    const [schedulingLink, setSchedulingLink] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const [interviewData, setInterviewData] = useState({
        questions: [
            { question: 'Technical Expertise', answer: '', score: 5, notes: '' },
            { question: 'Communication Skills', answer: '', score: 5, notes: '' }
        ],
        adminNotes: '',
        verificationScore: 50
    });

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.get(`${API_BASE}/expert-requests`, {
                headers: { 'x-auth-token': token }
            });
            setRequests(res.data);
        } catch (err) {
            showNotification("Failed to load requests", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchRequests(); 
        const timer = setInterval(() => setCurrentTime(new Date()), 5000);
        return () => clearInterval(timer);
    }, []);

    const showNotification = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const updateStatus = async (id, status, reason = '') => {
        // Optimistic update for "instant" feel
        setRequests(prev => prev.map(r => (r._id === id || r.id === id) ? { ...r, status, rejectionReason: reason } : r));

        try {
            const token = localStorage.getItem('auth-token');
            await axios.put(`${API_BASE}/expert-requests/${id}/status`, 
                { status, rejectionReason: reason }, 
                { headers: { 'x-auth-token': token } }
            );
            
            const successMsg = status === 'approved' ? "Expert approved successfully" : `Expert request ${status} successfully`;
            showNotification(successMsg, "success");
            
            fetchRequests();
            if (selectedRequest) {
                setSelectedRequest(prev => ({ ...prev, status, rejectionReason: reason }));
            }
            if (status === 'rejected') setIsRejectionModalOpen(false);
        } catch (err) {
            fetchRequests(); // Rollback to server state
            showNotification("Failed to update status", "error");
        }
    };

    const saveVerificationInterview = async () => {
        if (!selectedRequest) return;
        try {
            const id = selectedRequest._id || selectedRequest.id;
            const token = localStorage.getItem('auth-token');
            await axios.post(`${API_BASE}/expert-requests/${id}/verification`, 
                interviewData, 
                { headers: { 'x-auth-token': token } }
            );
            showNotification("Verification interview saved", "success");
            fetchRequests();
            setSelectedRequest(prev => ({ ...prev, verificationInterview: interviewData, status: 'under_review' }));
        } catch (err) {
            showNotification("Failed to save verification", "error");
        }
    };

    const generateAIQuestions = () => {
        const domain = selectedRequest?.domain || "General Tech";
        const aiQs = [
            { question: `Describe your experience with ${domain}`, answer: '', score: 0, notes: '' },
            { question: `Best practices in ${domain} architecture`, answer: '', score: 0, notes: '' },
            { question: `Common pitfalls and edge cases in ${domain}`, answer: '', score: 0, notes: '' }
        ];
        setInterviewData(prev => ({ ...prev, questions: aiQs }));
        showNotification("AI Questions generated for " + domain, "success");
    };

    const handleSchedule = async () => {
        if (!selectedRequest || !schedulingDate || !schedulingLink) return;
        setIsScheduling(true);
        try {
            const id = selectedRequest._id || selectedRequest.id;
            const token = localStorage.getItem('auth-token');
            await axios.put(`${API_BASE}/expert-requests/${id}/schedule`, 
                { meetingDateTime: schedulingDate, meetingLink: schedulingLink },
                { headers: { 'x-auth-token': token } }
            );
            showNotification("Meeting scheduled successfully", "success");
            fetchRequests();
            setSelectedRequest(prev => ({ 
                ...prev, 
                meetingStatus: 'scheduled', 
                meetingDateTime: schedulingDate, 
                meetingLink: schedulingLink 
            }));
        } catch (err) {
            showNotification("Failed to schedule meeting", "error");
        } finally {
            setIsScheduling(false);
        }
    };

    const markMeetingCompleted = async () => {
        if (!selectedRequest) return;
        try {
            const id = selectedRequest._id || selectedRequest.id;
            const token = localStorage.getItem('auth-token');
            await axios.put(`${API_BASE}/expert-requests/${id}/complete-meeting`, {}, {
                headers: { 'x-auth-token': token }
            });
            showNotification("Meeting marked as completed", "success");
            fetchRequests();
            setSelectedRequest(prev => ({ ...prev, meetingStatus: 'completed' }));
        } catch (err) {
            showNotification("Failed to update meeting status", "error");
        }
    };

    const getStatusStyle = (s) => {
        switch(s) {
            case 'pending': return { bg: '#fff7ed', text: '#c2410c', icon: <Clock size={14}/> };
            case 'under_review': return { bg: '#eff6ff', text: '#1d4ed8', icon: <Search size={14}/> };
            case 'accepted':
            case 'approved': return { bg: '#f0fdf4', text: '#15803d', icon: <Check size={14}/> };
            case 'rejected': return { bg: '#fef2f2', text: '#b91c1c', icon: <X size={14}/> };
            default: return { bg: '#f3f4f6', text: '#374151', icon: <Info size={14}/> };
        }
    };

    if (loading && !selectedRequest) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading verification system...</div>;

    const filteredRequests = statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter);

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
            <style>{`
                .tab-btn { padding: 0.75rem 1.25rem; border: none; background: none; cursor: pointer; font-weight: 600; color: #64748b; border-bottom: 2px solid transparent; transition: 0.2s; }
                .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); background: #f8fafc; }
                .req-row:hover { background: #f8fafc; cursor: pointer; }
                .btn-action { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; border-radius: 12px; font-weight: 600; cursor: pointer; width: 100%; border: 1px solid transparent; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 0.95rem; }
                .btn-action:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
                .btn-action:active { transform: translateY(0); }
                .btn-accept { background: var(--success-soft); color: var(--success); border-color: rgba(16, 185, 129, 0.2); }
                .btn-accept:hover { background: var(--success); color: white; border-color: var(--success); }
                .btn-review { background: var(--neutral-soft); color: var(--neutral); border-color: var(--border-subtle); }
                .btn-review:hover { background: var(--neutral); color: white; border-color: var(--neutral); }
                .btn-reject { background: var(--danger-soft); color: var(--danger); border-color: rgba(239, 68, 68, 0.2); }
                .btn-reject:hover { background: var(--danger); color: white; border-color: var(--danger); }
                .card-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
            `}</style>

            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>Expert Verification</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.25rem' }}>Approve or reject experts for the platform.</p>
                </div>
                {!selectedRequest && (
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--neutral-soft)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        {['all', 'pending', 'under_review', 'approved', 'rejected'].map(f => (
                            <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: '0.2s', background: statusFilter === f ? 'white' : 'transparent', color: statusFilter === f ? 'var(--primary)' : '#64748b', boxShadow: statusFilter === f ? 'var(--shadow-sm)' : 'none' }}>
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {message && <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#166534' : '#991b1b', border: '1px solid var(--border-subtle)' }}>{message.text}</div>}

            {!selectedRequest ? (
                <div className="card" style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-app)', borderBottom: '1px solid #f1f5f9' }}>
                            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1rem' }}>Expert</th>
                                <th style={{ padding: '1rem' }}>Domain</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(r => {
                                const st = getStatusStyle(r.status);
                                return (
                                    <tr key={r._id || r.id} className="req-row">
                                        <td onClick={() => setSelectedRequest(r)} style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '700' }}>{r.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>{r.domain}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ backgroundColor: st.bg, color: st.text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                                                {st.icon} {r.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button className="btn" onClick={() => setSelectedRequest(r)}>View Profile</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><User size={28}/></div>
                                <div><h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>{selectedRequest.name}</h2><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedRequest.email}</p></div>
                            </div>
                            <button className="btn" onClick={() => setSelectedRequest(null)} style={{ background: 'var(--neutral-soft)', color: '#475569' }}>← Back</button>
                        </div>
                        <div style={{ display: 'flex', background: 'var(--bg-app)', borderBottom: '1px solid #f1f5f9' }}>
                            {['profile', 'documents', 'video', 'interview'].map(t => (
                                <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t === 'video' ? 'Video Meeting' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
                            ))}
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            {activeTab === 'profile' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <section>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Professional Bio</h3>
                                        <p style={{ lineHeight: '1.6', color: '#475569' }}>{selectedRequest.bio}</p>
                                    </section>
                                    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.025em' }}>Contact & Location</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                                    <Phone size={16} color="#94a3b8" /> <span>{selectedRequest.phone || 'N/A'}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                                    <MapPin size={16} color="#94a3b8" /> <span>{selectedRequest.location || 'N/A'}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                                    <Clock size={16} color="#94a3b8" /> <span>{selectedRequest.experience || 'N/A'} of experience</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.025em' }}>Professional Links</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {selectedRequest.linkedinUrl ? (
                                                    <a href={selectedRequest.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#0077b5', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                                        <Linkedin size={16}/> LinkedIn Profile <ExternalLink size={12}/>
                                                    </a>
                                                ) : <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No LinkedIn</span>}
                                                {selectedRequest.githubUrl ? (
                                                    <a href={selectedRequest.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#1f2328', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                                        <Github size={16}/> GitHub Profile <ExternalLink size={12}/>
                                                    </a>
                                                ) : <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No GitHub</span>}
                                                {selectedRequest.portfolioUrl ? (
                                                    <a href={selectedRequest.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                                        <Globe size={16}/> Portfolio Website <ExternalLink size={12}/>
                                                    </a>
                                                ) : <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No Portfolio</span>}
                                            </div>
                                        </div>
                                    </section>

                                    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Technical Skills</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {selectedRequest.skills?.length > 0 ? (
                                                    selectedRequest.skills.map(s => <span key={s} style={{ padding: '6px 12px', background: '#eff6ff', color: '#3b82f6', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>{s}</span>)
                                                ) : <span style={{ color: 'var(--text-light)' }}>None listed</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Previous Companies</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {selectedRequest.previousCompanies?.length > 0 ? (
                                                    selectedRequest.previousCompanies.map(c => <span key={c} style={{ padding: '6px 12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>{c}</span>)
                                                ) : <span style={{ color: 'var(--text-light)' }}>None listed</span>}
                                            </div>
                                        </div>
                                    </section>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="btn" onClick={() => setActiveTab('video')} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Video size={18} /> Join Video Meeting
                                        </button>
                                        <button className="btn" onClick={() => setActiveTab('interview')} style={{ background: 'var(--bg-app)', color: '#4f46e5', border: '1px solid var(--border-subtle)' }}>Start Verification Evaluation</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                                    {selectedRequest.documents?.length > 0 ? selectedRequest.documents.map((doc, idx) => {
                                        const fullUrl = `http://localhost:5002${doc}`;
                                        const filename = doc.split('/').pop();
                                        return (
                                            <div key={idx} style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', borderRadius: '16px', background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                                                        <FileText size={20}/>
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Verification Doc</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                    <a href={fullUrl} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.5rem', flex: 1, textAlign: 'center', background: 'var(--neutral-soft)', color: '#475569', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                        <Eye size={14}/> View
                                                    </a>
                                                    <a href={fullUrl} download className="btn" style={{ padding: '0.5rem', flex: 1, textAlign: 'center', background: 'var(--neutral-soft)', color: '#475569', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                        <Download size={14}/> Save
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                                            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                            <p>No documents uploaded for this request.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'interview' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Verification Score: {interviewData.verificationScore}%</h3>
                                        <button className="btn" onClick={generateAIQuestions} style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}><Sparkles size={16}/> AI Questions</button>
                                    </div>
                                    {interviewData.questions.map((q, idx) => (
                                        <div key={idx} style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><label style={{ fontWeight: '700', fontSize: '0.9rem' }}>{q.question}</label> <input type="number" min="0" max="100" value={q.score} onChange={(e) => { const nQs = [...interviewData.questions]; nQs[idx].score = parseInt(e.target.value); setInterviewData({...interviewData, questions: nQs, verificationScore: Math.round(nQs.reduce((a,b)=>a+b.score,0)/nQs.length)}); }} style={{ width: '50px' }}/></div>
                                            <textarea placeholder="Admin notes..." value={q.notes} onChange={(e) => { const nQs = [...interviewData.questions]; nQs[idx].notes = e.target.value; setInterviewData({...interviewData, questions: nQs}); }} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', minHeight: '60px' }}/>
                                        </div>
                                    ))}
                                    <button className="btn" onClick={saveVerificationInterview} style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}><Save size={18}/> Save Evaluation</button>
                                </div>
                            )}                             {activeTab === 'video' && (
                                <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
                                    <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-panel)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Video size={18} color="#818cf8" />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Verification Meeting</h3>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{selectedRequest.meetingStatus === 'scheduled' ? 'Scheduled Session' : selectedRequest.meetingStatus === 'completed' ? 'Session Completed' : 'Unscheduled Session'}</div>
                                            </div>
                                        </div>
                                        {selectedRequest.meetingStatus === 'scheduled' && (
                                            <button 
                                                onClick={markMeetingCompleted}
                                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Check size={14} /> Mark as Completed
                                            </button>
                                        )}
                                    </div>

                                    {(!selectedRequest.meetingStatus || selectedRequest.meetingStatus === 'not_scheduled') ? (
                                        <div style={{ padding: '3rem 2rem', background: 'var(--bg-panel)', color: 'var(--text-main)' }}>
                                            <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                                                <div style={{ width: '64px', height: '64px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                                    <Clock size={32} />
                                                </div>
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Schedule a Meeting</h4>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Set a date and time for the video verification call. The expert will see this on their dashboard.</p>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Meeting Date & Time</label>
                                                        <input 
                                                            type="datetime-local" 
                                                            value={schedulingDate}
                                                            onChange={e => setSchedulingDate(e.target.value)}
                                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Google Meet Link</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                            value={schedulingLink}
                                                            onChange={e => setSchedulingLink(e.target.value)}
                                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                                                        />
                                                    </div>
                                                    <button 
                                                        disabled={isScheduling || !schedulingDate || !schedulingLink}
                                                        onClick={handleSchedule}
                                                        style={{ 
                                                            marginTop: '1rem', padding: '0.8rem', borderRadius: '12px', 
                                                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', 
                                                            border: 'none', fontWeight: 700, cursor: 'pointer', opacity: isScheduling ? 0.7 : 1
                                                        }}
                                                    >
                                                        {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', background: 'var(--bg-panel)', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                                            {selectedRequest.meetingStatus === 'completed' && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '2rem' }}>
                                                    <div>
                                                        <div style={{ width: '64px', height: '64px', background: '#059669', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                                            <Check size={32} />
                                                        </div>
                                                        <h3 style={{ fontSize: '1.25rem' }}>Verification Meeting Completed</h3>
                                                        <p style={{ opacity: 0.8, maxWidth: '300px' }}>You have marked this meeting as finished.</p>
                                                        <button 
                                                            onClick={() => setSelectedRequest(prev => ({...prev, meetingStatus: 'not_scheduled'}))}
                                                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            Reschedule if needed
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div style={{ textAlign: 'center', width: '100%', maxWidth: '500px' }}>
                                                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Scheduled For</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                                        {new Date(selectedRequest.meetingDateTime).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                                                    </div>
                                                </div>

                                                {(() => {
                                                    const startTime = new Date(selectedRequest.meetingDateTime).getTime();
                                                    const now = currentTime.getTime();
                                                    const fiveMinsBefore = startTime - 5 * 60000;
                                                    const oneHourAfter = startTime + 60 * 60000;
                                                    
                                                    const canJoin = now >= fiveMinsBefore && now <= oneHourAfter;
                                                    const isEarly = now < fiveMinsBefore;
                                                    const isExpired = now > oneHourAfter;

                                                    const handleJoin = async () => {
                                                        try {
                                                            const token = localStorage.getItem('auth-token');
                                                            const id = selectedRequest._id || selectedRequest.id;
                                                            const res = await axios.get(`${API_BASE}/expert-requests/${id}/meeting-access`, {
                                                                headers: { 'x-auth-token': token }
                                                            });
                                                            if (res.data.canJoin) {
                                                                let link = res.data.meetingLink;
                                                                if (!link.startsWith('http')) link = `https://meet.jit.si/${link}`;
                                                                window.open(link, '_blank');
                                                            } else {
                                                                showNotification(res.data.msg || "Cannot join yet", "error");
                                                            }
                                                        } catch (err) {
                                                            showNotification("Failed to validate meeting access", "error");
                                                        }
                                                    };

                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                                                            <button 
                                                                disabled={!canJoin}
                                                                onClick={handleJoin}
                                                                style={{ 
                                                                    padding: '1rem 2.5rem', borderRadius: '16px', border: 'none',
                                                                    background: canJoin ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e2e8f0',
                                                                    color: canJoin ? 'white' : '#94a3b8',
                                                                    fontWeight: 700, fontSize: '1rem', cursor: canJoin ? 'pointer' : 'not-allowed',
                                                                    boxShadow: canJoin ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : 'none',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <Video size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Join Google Meet as Admin
                                                            </button>
                                                            
                                                            {isEarly && <div style={{ color: 'var(--warning)', fontWeight: 600 }}>Meeting not started yet</div>}
                                                            {isExpired && <div style={{ color: 'var(--danger)', fontWeight: 600 }}>Meeting expired</div>}
                                                            {canJoin && <div style={{ color: 'var(--success)', fontWeight: 600 }}>Meeting is LIVE!</div>}
                                                            
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '1rem' }}>
                                                                Meet URL: <span style={{ color: '#6366f1' }}>{selectedRequest.meetingLink}</span>
                                                            </p>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-panel)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Final Decision</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button className="btn-action btn-accept" onClick={() => updateStatus(selectedRequest._id || selectedRequest.id, 'approved')}><CheckCircle size={20}/> Accept Application</button>
                                <button className="btn-action btn-review" onClick={() => updateStatus(selectedRequest._id || selectedRequest.id, 'under_review')}><Search size={20}/> Mark Review</button>
                                <button className="btn-action btn-reject" onClick={() => setIsRejectionModalOpen(true)}><XCircle size={20}/> Reject Application</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isRejectionModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ maxWidth: '400px', width: '90%', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Reason for Rejection</h3>
                        <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', minHeight: '100px', marginBottom: '1rem' }} placeholder="Provide feedback to the candidate..."/>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsRejectionModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => updateStatus(selectedRequest._id || selectedRequest.id, 'rejected', rejectionReason)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function JitsiMeetComponent({ requestId }) {
    const containerRef = React.useRef(null);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (!requestId) return;
        
        if (!window.JitsiMeetExternalAPI) {
            setError("Jitsi Meet SDK not found. Please refresh the page.");
            return;
        }

        const domain = 'meet.jit.si';
        const options = {
            roomName: `Confido_Verification_${requestId}`,
            width: '100%',
            height: 600,
            parentNode: containerRef.current,
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        
        return () => {
            api.dispose();
        };
    }, [requestId]);

    if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: 'white' }}><AlertCircle size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} /><p>{error}</p></div>;

    return <div ref={containerRef} style={{ height: '600px', width: '100%' }} />;
}

