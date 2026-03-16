import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export function AdminSettings() {
    const [settings, setSettings] = useState({
        siteName: '',
        maintenanceMode: false,
        aiModel: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await axios.get('http://localhost:5002/api/admin/settings', {
                    headers: { 'x-auth-token': token }
                });
                setSettings(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('auth-token');
            await axios.put('http://localhost:5002/api/admin/settings', settings, {
                headers: { 'x-auth-token': token }
            });
            alert("Settings saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Settings...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SettingsIcon size={28} /> Platform Settings
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure core system functionality and AI models.</p>
            </header>

            <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Site Name</label>
                    <input 
                        type="text" 
                        value={settings.siteName}
                        onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>AI Evaluation Model</label>
                    <select 
                        value={settings.aiModel}
                        onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                    >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</option>
                        <option value="gpt-4">GPT-4 (Most Accurate)</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--bg-app)', borderRadius: '8px' }}>
                    <input 
                        type="checkbox" 
                        id="maintenance"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                        style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="maintenance" style={{ fontWeight: '500', cursor: 'pointer' }}>Enable Maintenance Mode</label>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-1rem', marginLeft: '2rem' }}>
                    If checked, only Administrators can log into the platform. Non-admins will see a maintenance screen.
                </p>

                <button type="submit" className="btn" disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </form>
        </div>
    );
}
