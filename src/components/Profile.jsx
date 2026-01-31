import React from 'react';
import { User, CreditCard, Bell, Shield } from 'lucide-react';

export function Profile() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="section-title">My Profile</h1>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Profile"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f1f5f9' }}
                />
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Sarah Williams</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Software Engineer • New York, USA</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>Pro Member</span>
                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem' }}>Frontend Path</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                    { icon: User, label: 'Personal Information', desc: 'Update your name and career details' },
                    { icon: CreditCard, label: 'Subscription & Billing', desc: 'Manage your Pro plan and payments' },
                    { icon: Bell, label: 'Notifications', desc: 'Email and push notification preferences' },
                    { icon: Shield, label: 'Security', desc: 'Password and authentication' },
                ].map((item, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}>
                        <div style={{
                            padding: '12px', background: '#f8fafc', borderRadius: '12px',
                            color: 'var(--text-muted)'
                        }}>
                            <item.icon size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.label}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.desc}</p>
                        </div>
                        <div style={{ color: '#cbd5e1' }}>›</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
