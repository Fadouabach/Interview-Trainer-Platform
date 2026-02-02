import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, Users, BarChart2, User, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname.substring(1) || 'dashboard'; // remove leading slash

    const { user } = useAuth();
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'setup', label: 'Practice Interview', icon: PlayCircle, path: '/setup' },
        { id: 'experts', label: 'Expert Sessions', icon: Users, path: '/experts' },
        { id: 'results', label: 'My Progress', icon: BarChart2, path: '/results' },
        ...(user ? [{ id: 'profile', label: 'Profile', icon: User, path: '/profile' }] : []),
    ];

    // Helper to check active state
    const isActiveVal = (item) => {
        if (location.pathname.startsWith(item.path)) return true;
        if (item.id === 'setup' && location.pathname.includes('session')) return true;
        return false;
    }

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
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
                <img src={logo} alt="Confido Logo" style={{ height: '40px' }} />
            </div>

            <nav style={{ flex: 1, padding: '1rem' }}>
                <ul style={{ listStyle: 'none' }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveVal(item);

                        return (
                            <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                                <button
                                    onClick={() => navigate(item.path)}
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
                {user ? (
                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: 'transparent', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            padding: '0.5rem', fontWeight: '500'
                        }}>
                        <LogOut size={20} />
                        Sign Out
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: 'var(--primary)', border: 'none',
                            color: 'white', cursor: 'pointer',
                            padding: '0.75rem 1rem', borderRadius: '8px',
                            fontWeight: '600', width: '100%', justifyContent: 'center'
                        }}>
                        <User size={20} />
                        Sign In
                    </button>
                )}
            </div>
        </aside>
    );
}
