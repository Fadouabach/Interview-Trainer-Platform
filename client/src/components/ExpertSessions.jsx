import React, { useState, useEffect } from 'react';
import { Star, Clock, Video, User, Calendar, Target } from 'lucide-react';
import axios from 'axios';
import { BookingList } from './BookingList';

export function ExpertSessions() {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [bookingStep, setBookingStep] = useState(null); // 'profile', 'book'
    const [bookingData, setBookingData] = useState({
        sessionType: '',
        date: '',
        time: '',
        goal: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');
    const [activeView, setActiveView] = useState('experts'); // 'experts', 'my-sessions'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const res = await axios.get('http://localhost:5002/api/experts');
                setExperts(res.data);
            } catch (err) {
                console.error("Failed to fetch experts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExperts();
    }, []);

    const filteredExperts = experts.filter(expert => 
        expert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleBook = async () => {
        setSubmitting(true);
        setMsg('');
        try {
            const token = localStorage.getItem('auth-token');
            await axios.post('http://localhost:5002/api/bookings', {
                expertId: selectedExpert._id,
                ...bookingData
            }, {
                headers: { 'x-auth-token': token }
            });
            setMsg('Session booked successfully!');
            setTimeout(() => {
                setSelectedExpert(null);
                setBookingStep(null);
            }, 2000);
        } catch (err) {
            setMsg('Failed to book session.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="section-title">
                <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
                    <Video size={24} color="var(--primary)" />
                </div>
                Expert Mock Interviews
            </h1>

            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveView('experts')}
                    style={{
                        padding: '1rem 0', background: 'none', border: 'none',
                        color: activeView === 'experts' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '600', borderBottom: activeView === 'experts' ? '2px solid var(--primary)' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    Find an Expert
                </button>
                <button
                    onClick={() => setActiveView('my-sessions')}
                    style={{
                        padding: '1rem 0', background: 'none', border: 'none',
                        color: activeView === 'my-sessions' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '600', borderBottom: activeView === 'my-sessions' ? '2px solid var(--primary)' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    My Sessions
                </button>
            </div>

            {activeView === 'experts' ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                            Book 1:1 sessions with industry veterans for realistic practice and personalized feedback.
                        </p>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="Search by name, role, or skill..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    padding: '0.6rem 1rem 0.6rem 2.5rem', 
                                    borderRadius: '10px', 
                                    border: '1px solid var(--border-subtle)', 
                                    width: '320px',
                                    fontSize: '0.9rem',
                                    background: 'var(--bg-app)'
                                }}
                            />
                            <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Showing <strong>{filteredExperts.length}</strong> {filteredExperts.length === 1 ? 'expert' : 'experts'}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading experts...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                            {filteredExperts.map((expert) => (
                                <div key={expert._id} className="card" style={{ display: 'flex', gap: '1.5rem', transition: '0.3s', cursor: 'pointer' }} onClick={() => { setSelectedExpert(expert); setBookingStep('profile'); }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '16px', background: '#f8fafc', overflow: 'hidden', flexShrink: 0 }}>
                                        {expert.avatar ? <img src={expert.avatar} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e7ff', color: '#4f46e5' }}><User size={40}/></div>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{expert.name}</h3>
                                            <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>${expert.price}</div>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            {expert.title || expert.field} • <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{expert.company}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                                                <Star size={14} fill="currentColor" />
                                                <span style={{ fontWeight: '700', color: '#1e293b' }}>{expert.rating || 0}</span>
                                            </div>
                                            <span style={{ color: '#94a3b8' }}>•</span>
                                            <span style={{ color: '#64748b' }}>{expert.location || 'Remote'}</span>
                                            <span style={{ color: '#94a3b8' }}>•</span>
                                            <span style={{ color: '#64748b' }}>{expert.experience || 'Senior'} exp</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                            {(expert.skills || []).slice(0, 3).map((s, i) => (
                                                <span key={i} style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b' }}>{s}</span>
                                            ))}
                                            {expert.skills?.length > 3 && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>+{expert.skills.length - 3} more</span>}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                className="btn"
                                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedExpert(expert); setBookingStep('book'); }}
                                            >
                                                Book Session
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedExpert(expert); setBookingStep('profile'); }}
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <BookingList role="user" />
            )}

            {/* Modal Overlay */}
            {selectedExpert && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zInstruction: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 0, borderRadius: '24px' }}>
                        <div style={{ position: 'sticky', top: 0, background: 'white', padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#f8fafc', overflow: 'hidden' }}>
                                    {selectedExpert.avatar ? <img src={selectedExpert.avatar} alt={selectedExpert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e7ff', color: '#4f46e5' }}><User size={30}/></div>}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedExpert.name}</h2>
                                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>{selectedExpert.title || selectedExpert.field} @ {selectedExpert.company}</p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedExpert(null); setBookingStep(null); }} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>&times;</button>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            {bookingStep === 'profile' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '2.5rem' }}>
                                    <div>
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '800' }}>About</h3>
                                            <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1rem' }}>{selectedExpert.bio || "No biography provided."}</p>
                                        </section>

                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '800' }}>Skills & Expertise</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                                {(selectedExpert.skills || []).map((s, i) => (
                                                    <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>{s}</span>
                                                ))}
                                            </div>
                                        </section>

                                        <section>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '800' }}>Session Types</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                {(selectedExpert.sessionTypes || ['Mock Interview', 'Tech Review']).map((type, i) => (
                                                    <div key={i} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <Check size={18} color="#10b981" />
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '2rem' }}>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>${selectedExpert.price}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>per session</div>
                                            <button className="btn" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setBookingStep('book')}>Book Now</button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}>
                                                <Target size={18} color="#94a3b8" /> {selectedExpert.experience} experience
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}>
                                                <Calendar size={18} color="#94a3b8" /> Member since {new Date(selectedExpert.createdAt).getFullYear()}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid #f1f5f9' }}>
                                            <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social Links</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {selectedExpert.linkedinUrl && <a href={selectedExpert.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1d4ed8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}><Check size={16} /> LinkedIn</a>}
                                                {selectedExpert.githubUrl && <a href={selectedExpert.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}><Check size={16} /> GitHub</a>}
                                                {selectedExpert.portfolioUrl && <a href={selectedExpert.portfolioUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#7c3aed', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}><Check size={16} /> Portfolio</a>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bookingStep === 'book' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {msg && <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '8px' }}>{msg}</div>}

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Session Type</label>
                                        <select
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                                            value={bookingData.sessionType}
                                            onChange={(e) => setBookingData({ ...bookingData, sessionType: e.target.value })}
                                        >
                                            <option value="">Choose a type...</option>
                                            {selectedExpert.sessionTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date</label>
                                            <input
                                                type="date"
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                                                value={bookingData.date}
                                                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Time</label>
                                            <input
                                                type="time"
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                                                value={bookingData.time}
                                                onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>What is your goal for this session?</label>
                                        <textarea
                                            rows={3}
                                            placeholder="e.g. Help with binary search questions, Behavioral mock interview for Amazon..."
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontFamily: 'inherit' }}
                                            value={bookingData.goal}
                                            onChange={(e) => setBookingData({ ...bookingData, goal: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setBookingStep('profile')}>Back</button>
                                        <button
                                            className="btn"
                                            style={{ flex: 2 }}
                                            disabled={submitting || !bookingData.sessionType || !bookingData.date || !bookingData.time || !bookingData.goal}
                                            onClick={handleBook}
                                        >
                                            {submitting ? 'Booking...' : `Pay & Book ($${selectedExpert.price})`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
