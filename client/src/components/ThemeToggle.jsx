import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({ style = {} }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                ...style
            }}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <>
                    <Moon size={18} />
                    <span>Dark Mode</span>
                </>
            ) : (
                <>
                    <Sun size={18} />
                    <span>Light Mode</span>
                </>
            )}
        </button>
    );
}
