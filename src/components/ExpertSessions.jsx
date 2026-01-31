import React from 'react';
import { Star, Clock, Video } from 'lucide-react';

export function ExpertSessions() {
    const experts = [
        { name: 'Jihane K.', title: 'Frontend & React Expert', company: 'Ex-Google', rating: 5.0, reviews: 102, price: '$55', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jihane' },
        { name: 'Kareem L.', title: 'Backend & Coding', company: 'Amazon', rating: 4.9, reviews: 85, price: '$55', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kareem' },
        { name: 'Sarah W.', title: 'System Design', company: 'Netflix', rating: 5.0, reviews: 44, price: '$70', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahW' },
        { name: 'David C.', title: 'Behavioral Coach', company: 'HR Lead', rating: 4.8, reviews: 120, price: '$40', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="section-title">
                <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
                    <Video size={24} color="var(--primary)" />
                </div>
                Expert Mock Interviews
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Book 1:1 sessions with industry veterans for realistic practice and personalized feedback.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {experts.map((expert, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', gap: '1.5rem' }}>
                        <img
                            src={expert.img}
                            alt={expert.name}
                            style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#f1f5f9' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <h3 style={{ fontSize: '1.2rem' }}>{expert.name}</h3>
                                <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{expert.price}</div>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                {expert.title} • <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{expert.company}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                <span style={{ fontWeight: '600' }}>{expert.rating}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({expert.reviews} sessions)</span>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn" style={{ flex: 1, padding: '0.6rem' }}>Book Session</button>
                                <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }}>Profile</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
