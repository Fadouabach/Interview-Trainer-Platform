import React, { useState } from 'react';
import { User, CreditCard, Bell, Shield, Save } from 'lucide-react';
import axios from 'axios';

export function Profile({ user }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        field: user?.field || ''
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.put('http://localhost:5001/api/users/profile', formData, {
                headers: { 'x-auth-token': token }
            });
            setMsg('Profile updated successfully!');
            if (window.updateUser) window.updateUser(res.data);
        } catch (err) {
            setMsg('Failed to update profile.');
            console.error(err);
        }
        setSaving(false);
    };

    const handleImageChange = (e) => {
        // Removed avatar upload logic
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="section-title">My Profile</h1>

            <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{
                    fontSize: '3rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    marginBottom: '1rem'
                }}>
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{user?.name}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    {user?.role === 'expert' ? 'Expert Coach' : 'Aspiring Developer'}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>Pro Member</span>
                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem' }}>{formData.field || 'General'}</span>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
                {msg && <div style={{ marginBottom: '1rem', color: msg.includes('success') ? 'green' : 'red' }}>{msg}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Field</label>
                        <input
                            name="field"
                            value={formData.field}
                            onChange={handleChange}
                            placeholder="e.g. Frontend Development"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Tell us about your goals..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <button className="btn" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {[
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
