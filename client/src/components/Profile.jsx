import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Shield, ShieldCheck, ShieldAlert, CreditCard, Bell, Lock, ChevronRight, Save, X, Github, Linkedin, Smartphone, MapPin, DollarSign, ExternalLink, Globe, Upload, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function Profile({ user }) {
    const { setUser } = useAuth(); // Restoring usage since I'm re-adding it to AuthContext if needed, or just using window.updateUser
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        field: user?.field || '',
        experience: user?.experience || 'Beginner',
        title: user?.title || '',
        company: user?.company || '',
        price: user?.price || 0,
        location: user?.location || '',
        phone: user?.phone || '',
        linkedinUrl: user?.linkedinUrl || '',
        githubUrl: user?.githubUrl || '',
        portfolioUrl: user?.portfolioUrl || '',
        skills: user?.skills || [],
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Active Settings View ('main', 'subscription', 'notifications', 'security')
    const [activeView, setActiveView] = useState('main');

    // Async Settings States
    const [subData, setSubData] = useState({ plan: 'free', status: 'none', loading: true });
    const [notifData, setNotifData] = useState({ email: true, push: true, loading: true });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    
    // Security Form State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [secMsg, setSecMsg] = useState({ text: '', type: '' });
    const [secLoading, setSecLoading] = useState(false);

    const token = localStorage.getItem('auth-token');

    useEffect(() => {
        if (activeView === 'subscription' && subData.loading) {
            axios.get('http://localhost:5002/api/subscription', { headers: { 'x-auth-token': token } })
                .then(res => setSubData({ plan: res.data.plan, status: res.data.subscriptionStatus, loading: false }))
                .catch(err => setSubData(prev => ({ ...prev, loading: false })));
        }
        if (activeView === 'notifications' && notifData.loading) {
            axios.get('http://localhost:5002/api/users/profile', { headers: { 'x-auth-token': token } })
                .then(res => setNotifData({ email: res.data.emailNotifications ?? true, push: res.data.pushNotifications ?? true, loading: false }))
                .catch(err => setNotifData(prev => ({ ...prev, loading: false })));
        }
    }, [activeView, token, subData.loading, notifData.loading]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setMsg({ text: '', type: '' });
        try {
            const res = await axios.put('http://localhost:5002/api/users/profile', formData, {
                headers: { 'x-auth-token': token }
            });
            setMsg({ text: 'Profile updated successfully!', type: 'success' });
            if (window.updateUser) window.updateUser(res.data);
            if (setUser) setUser(res.data);
            setTimeout(() => setMsg({ text: '', type: '' }), 4000);
        } catch (err) {
            setMsg({ text: 'Failed to update profile.', type: 'error' });
            console.error(err);
        }
        setSaving(false);
    };

    // Subscription Actions
    const handleUpgradeClick = () => {
        setShowPaymentModal(true);
    };

    const confirmPayment = async () => {
        setPaymentProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            const res = await axios.post('http://localhost:5002/api/subscription/upgrade', {}, { headers: { 'x-auth-token': token } });
            setSubData({ plan: res.data.plan, status: res.data.subscriptionStatus, loading: false });
            setShowPaymentModal(false);
            setMsg({ text: 'Payment successful! Welcome to Pro.', type: 'success' });
            setTimeout(() => setMsg({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error(err);
            alert("Payment processing failed.");
        } finally {
            setPaymentProcessing(false);
        }
    };

    const handleCancelSub = async () => {
        setSubData(prev => ({ ...prev, loading: true }));
        try {
            const res = await axios.post('http://localhost:5002/api/subscription/cancel', {}, { headers: { 'x-auth-token': token } });
            setSubData({ plan: res.data.plan, status: res.data.subscriptionStatus, loading: false });
        } catch (err) {
            console.error(err);
            setSubData(prev => ({ ...prev, loading: false }));
        }
    };

    // Notification Actions
    const toggleNotif = async (type) => {
        const updated = { ...notifData, [type]: !notifData[type] };
        setNotifData({ ...updated, loading: true });
        try {
            await axios.put('http://localhost:5002/api/users/notifications', {
                emailNotifications: updated.email,
                pushNotifications: updated.push
            }, { headers: { 'x-auth-token': token } });
            setNotifData({ ...updated, loading: false });
        } catch (err) {
            console.error(err);
            setNotifData({ ...updated, loading: false });
        }
    };

    // Security Actions
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setSecMsg({ text: '', type: '' });
        if (passwords.new !== passwords.confirm) return setSecMsg({ text: 'Passwords do not match', type: 'error' });
        setSecLoading(true);
        try {
            await axios.put('http://localhost:5002/api/users/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new,
                confirmPassword: passwords.confirm
            }, { headers: { 'x-auth-token': token } });
            setSecMsg({ text: 'Password successfully updated!', type: 'success' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            setSecMsg({ text: err.response?.data?.msg || 'Failed to update password', type: 'error' });
        }
        setSecLoading(false);
    };

    const inputStyle = {
        width: '100%', padding: '0.875rem 1rem', borderRadius: '10px',
        border: '1px solid var(--border-subtle)', background: 'var(--bg-app)',
        color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none',
        transition: 'all 0.2s ease', fontFamily: 'inherit'
    };

    const labelStyle = { display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' };

    const renderSettingView = () => {
        if (activeView === 'subscription') {
            return (
                <div className="card" style={{ padding: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
                    <button onClick={() => setActiveView('main')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}>
                        <ArrowLeft size={18} /> Back to Profile
                    </button>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Subscription & Billing</h2>
                    {subData.loading ? <Loader2 className="spinning" size={24} /> : (
                        <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Current Plan</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'capitalize' }}>{subData.plan}</div>
                                </div>
                                <div style={{ 
                                    padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                                    background: subData.status === 'active' ? 'var(--success-soft)' : 'var(--neutral-soft)',
                                    color: subData.status === 'active' ? 'var(--success)' : 'var(--text-muted)'
                                }}>Status: {subData.status}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {subData.plan === 'free' ? (
                                    <button onClick={handleUpgradeClick} className="btn" style={{ padding: '0.875rem 2rem' }}><CreditCard size={18} /> Upgrade to Pro</button>
                                ) : (
                                    <button onClick={handleCancelSub} style={{ padding: '0.875rem 2rem', background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel Subscription</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        if (activeView === 'notifications') {
            return (
                <div className="card" style={{ padding: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
                    <button onClick={() => setActiveView('main')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}>
                        <ArrowLeft size={18} /> Back to Profile
                    </button>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Notification Preferences</h2>
                    {notifData.loading ? <Loader2 className="spinning" size={24} /> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {['email', 'push'].map(type => (
                                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', textTransform: 'capitalize' }}>{type} Notifications</h4>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Receive updates via {type}.</p>
                                    </div>
                                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                        <input type="checkbox" checked={notifData[type]} onChange={() => toggleNotif(type)} style={{ opacity: 0, width: 0, height: 0 }} />
                                        <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, backgroundColor: notifData[type] ? 'var(--primary)' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}>
                                            <span style={{ position: 'absolute', height: '20px', width: '20px', left: notifData[type] ? '26px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        if (activeView === 'security') {
            return (
                <div className="card" style={{ padding: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
                    <button onClick={() => setActiveView('main')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}>
                        <ArrowLeft size={18} /> Back to Profile
                    </button>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Security & Password</h2>
                    {secMsg.text && <div style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '10px', background: secMsg.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)', color: secMsg.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>{secMsg.text}</div>}
                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                        <div><label style={labelStyle}>Current Password</label><input type="password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} style={inputStyle} /></div>
                        <div><label style={labelStyle}>New Password</label><input type="password" required minLength={6} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Confirm Password</label><input type="password" required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} style={inputStyle} /></div>
                        <button type="submit" disabled={secLoading} className="btn" style={{ padding: '0.875rem 2rem' }}>{secLoading ? <Loader2 className="spinning" size={18} /> : 'Update Password'}</button>
                    </form>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2rem' }}>Profile Settings</h1>
            {activeView !== 'main' ? renderSettingView() : (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '2.5rem', boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)' }}>
                            {getInitials(user?.name)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)', fontWeight: 700 }}>{user?.name || 'User'}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <Mail size={16} />
                                {user?.email || 'No email provided'}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                        {msg.text && <div style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '10px', background: msg.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)', color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>{msg.text}</div>}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                                <User size={20} color="#4f46e5" /> Personal Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div><label style={labelStyle}>Full Name</label><input name="name" value={formData.name} onChange={handleChange} style={inputStyle} /></div>
                                <div><label style={labelStyle}>Email Address</label><input name="email" value={formData.email} readOnly style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} /></div>
                            </div>
                            <div><label style={labelStyle}>Bio</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                        </div>
                        {user?.role === 'expert' && (
                            <div style={{ marginBottom: '2.5rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border-subtle)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                                    <ShieldCheck size={20} color="#10b981" /> Professional Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div><label style={labelStyle}>Title</label><input name="title" value={formData.title} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Hourly Rate ($)</label><input name="price" type="number" value={formData.price} onChange={handleChange} style={inputStyle} /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div><label style={labelStyle}>LinkedIn URL</label><input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>GitHub URL</label><input name="githubUrl" value={formData.githubUrl} onChange={handleChange} style={inputStyle} /></div>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={handleSaveProfile} disabled={saving} className="btn" style={{ padding: '0.875rem 2rem' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Account Settings</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {[
                            { view: 'subscription', icon: CreditCard, label: 'Subscription & Billing', desc: 'Manage your plan', color: '#10b981' },
                            { view: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert preferences', color: '#f59e0b' },
                            { view: 'security', icon: Shield, label: 'Security', desc: 'Password updates', color: '#ef4444' },
                        ].map((item, idx) => (
                            <div key={idx} className="card" onClick={() => setActiveView(item.view)} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', padding: '1.5rem', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '12px', color: item.color }}><item.icon size={24} /></div>
                                <div style={{ flex: 1 }}><h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>{item.label}</h4><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.desc}</p></div>
                                <div style={{ color: 'var(--text-light)' }}>›</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {showPaymentModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ padding: '2.5rem', maxWidth: '400px', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Upgrade to Pro</h2>
                        <p style={{ marginBottom: '2rem' }}>Get unlimited access for $19/mo.</p>
                        <button onClick={confirmPayment} className="btn" style={{ width: '100%', marginBottom: '1rem' }}>{paymentProcessing ? 'Processing...' : 'Confirm Payment'}</button>
                        <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{__html: `@keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spinning { animation: spinning 1s linear infinite; }`}} />
        </div>
    );
}
