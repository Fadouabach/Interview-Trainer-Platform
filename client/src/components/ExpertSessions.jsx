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

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/experts');
                setExperts(res.data);
            } catch (err) {
                console.error("Failed to fetch experts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExperts();
    }, []);

    const handleBook = async () => {
        setSubmitting(true);
        setMsg('');
        try {
            const token = localStorage.getItem('auth-token');
            await axios.post('http://localhost:5001/api/bookings', {
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
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Book 1:1 sessions with industry veterans for realistic practice and personalized feedback.
                    </p>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading experts...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                            {experts.map((expert) => (
                                <div key={expert._id} className="card" style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <h3 style={{ fontSize: '1.2rem' }}>{expert.name}</h3>
                                            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${expert.price}</div>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            {expert.title} • <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{expert.company}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                            <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                            <span style={{ fontWeight: '600' }}>{expert.rating || 0}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({expert.reviewsCount || 0} sessions)</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                className="btn"
                                                style={{ flex: 1, padding: '0.6rem' }}
                                                onClick={() => { setSelectedExpert(expert); setBookingStep('book'); }}
                                            >
                                                Book Session
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.6rem 1rem' }}
                                                onClick={() => { setSelectedExpert(expert); setBookingStep('profile'); }}
                                            >
                                                Profile
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
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                }}>
                    <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div>
                                    <h2 style={{ marginBottom: '0.25rem' }}>{selectedExpert.name}</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>{selectedExpert.title} @ {selectedExpert.company}</p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedExpert(null); setBookingStep(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        {bookingStep === 'profile' && (
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>About</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>{selectedExpert.bio || "No biography provided."}</p>

                                <h3 style={{ marginBottom: '1rem' }}>Session Types</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
                                    {(selectedExpert.sessionTypes || []).map((type, i) => (
                                        <span key={i} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.875rem' }}>{type}</span>
                                    ))}
                                </div>

                                <button className="btn" style={{ width: '100%' }} onClick={() => setBookingStep('book')}>Proceed to Booking</button>
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
            )}
        </div>
    );
}
