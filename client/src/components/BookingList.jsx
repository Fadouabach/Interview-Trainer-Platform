import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

export function BookingList({ role }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [feedbackData, setFeedbackData] = useState({ id: '', text: '' });
    const [ratingData, setRatingData] = useState({ id: '', rating: 5, review: '' });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const endpoint = role === 'expert' ? '/api/bookings/expert-bookings' : '/api/bookings/my-bookings';
                const res = await axios.get(`http://localhost:5001${endpoint}`, {
                    headers: { 'x-auth-token': token }
                });
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [role]);

    const handleFeedback = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            await axios.put(`http://localhost:5001/api/bookings/${feedbackData.id}/feedback`,
                { feedback: feedbackData.text },
                { headers: { 'x-auth-token': token } }
            );
            // Refresh list
            setBookings(bookings.map(b => b._id === feedbackData.id ? { ...b, expertFeedback: feedbackData.text, status: 'completed' } : b));
            setFeedbackData({ id: '', text: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleRate = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            await axios.put(`http://localhost:5001/api/bookings/${ratingData.id}/rate`,
                { rating: ratingData.rating, review: ratingData.review },
                { headers: { 'x-auth-token': token } }
            );
            // Refresh list
            setBookings(bookings.map(b => b._id === ratingData.id ? { ...b, userRating: ratingData.rating, userReview: ratingData.review } : b));
            setRatingData({ id: '', rating: 5, review: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = bookings.filter(b => {
        if (activeTab === 'upcoming') return b.status === 'pending' || b.status === 'confirmed';
        return b.status === 'completed' || b.status === 'cancelled';
    });

    if (loading) return <div style={{ padding: '2rem' }}>Loading sessions...</div>;

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    style={{
                        padding: '0.75rem 0', background: 'none', border: 'none',
                        color: activeTab === 'upcoming' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '600', borderBottom: activeTab === 'upcoming' ? '2px solid var(--primary)' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    Upcoming Sessions
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    style={{
                        padding: '0.75rem 0', background: 'none', border: 'none',
                        color: activeTab === 'past' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '600', borderBottom: activeTab === 'past' ? '2px solid var(--primary)' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    Past Sessions
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No sessions found.</p>}

                {filtered.map(booking => (
                    <div key={booking._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '12px', color: 'var(--primary)' }}>
                                    {booking.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem' }}>{booking.sessionType}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {new Date(booking.date).toLocaleDateString()} at {booking.time} •
                                        With {role === 'expert' ? booking.userId?.name : booking.expertId?.name}
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                background: booking.status === 'completed' ? '#dcfce7' : '#f1f5f9',
                                color: booking.status === 'completed' ? '#166534' : '#64748b'
                            }}>
                                {booking.status.toUpperCase()}
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}><strong>Goal:</strong> {booking.goal}</p>
                        </div>

                        {/* Expert Feedback Section */}
                        {(booking.expertFeedback || (role === 'expert' && booking.status === 'pending')) && (
                            <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <MessageSquare size={16} /> Expert Feedback
                                </h5>
                                {booking.expertFeedback ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{booking.expertFeedback}"</p>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <textarea
                                            placeholder="Add your feedback for the student..."
                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                                            value={feedbackData.id === booking._id ? feedbackData.text : ''}
                                            onChange={(e) => setFeedbackData({ id: booking._id, text: e.target.value })}
                                        />
                                        <button className="btn btn-sm" onClick={handleFeedback} disabled={feedbackData.id !== booking._id || !feedbackData.text}>Send</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Rating Section */}
                        {booking.status === 'completed' && (booking.userRating || (role !== 'expert')) && (
                            <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Star size={16} /> Rating & Review
                                </h5>
                                {booking.userRating ? (
                                    <div>
                                        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < booking.userRating ? "#fbbf24" : "none"} color={i < booking.userRating ? "#fbbf24" : "#cbd5e1"} />
                                            ))}
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{booking.userReview}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setRatingData({ ...ratingData, id: booking._id, rating: v })}
                                                    style={{
                                                        background: ratingData.id === booking._id && ratingData.rating >= v ? '#fbbf24' : '#f1f5f9',
                                                        border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px'
                                                    }}
                                                >
                                                    <Star size={16} fill={ratingData.id === booking._id && ratingData.rating >= v ? "white" : "none"} color={ratingData.id === booking._id && ratingData.rating >= v ? "white" : "#64748b"} />
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                placeholder="Write a short review..."
                                                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                                                value={ratingData.id === booking._id ? ratingData.review : ''}
                                                onChange={(e) => setRatingData({ ...ratingData, id: booking._id, review: e.target.value })}
                                            />
                                            <button className="btn btn-sm" onClick={handleRate} disabled={ratingData.id !== booking._id}>Rate</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
