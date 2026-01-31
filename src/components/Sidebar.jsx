import React from 'react';
import { LayoutDashboard, PlayCircle, Users, BarChart2, User, LogOut } from 'lucide-react';

export function Sidebar({ currentView, setView }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'home', label: 'Practice Interview', icon: PlayCircle }, // 'home' was the original view for starting setup
        { id: 'experts', label: 'Expert Sessions', icon: Users },
        { id: 'results', label: 'My Progress', icon: BarChart2 }, // reusing results view for now as progress
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            backgroundColor: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '32px', height: '32px',
                    background: 'linear-gradient(135deg, var(--primary), #4338ca)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold'
                }}>
                    IT
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    Interview Trainer
                </span>
            </div>

            <nav style={{ flex: 1, padding: '1rem' }}>
                <ul style={{ listStyle: 'none' }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id || (item.id === 'home' && currentView === 'setup') || (currentView === 'session' && item.id === 'home');

                        return (
                            <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                                <button
                                    onClick={() => setView(item.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.875rem 1rem',
                                        border: 'none',
                                        borderRadius: '12px',
                                        background: isActive ? 'white' : 'transparent',
                                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: isActive ? '600' : '500',
                                        cursor: 'pointer',
                                        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left'
                                    }}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    padding: '0.5rem', fontWeight: '500'
                }}>
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
