import React from 'react';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer style={{
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '4rem 2rem 2rem',
            marginTop: '4rem',
            color: 'var(--text-main)'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '3rem',
                marginBottom: '4rem'
            }}>
                {/* Brand Section */}
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--primary)' }}>Confido</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        Empowering professionals to ace their interviews with AI-driven feedback and expert coaching.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="Github"><Github size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="LinkedIn"><Linkedin size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="Twitter"><Twitter size={20} /></a>
                    </div>
                </div>

                {/* About Section */}
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '1.5rem', color: '#0f172a' }}>About</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Our Story</a></li>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>How It Works</a></li>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Success Stories</a></li>
                    </ul>
                </div>

                {/* Services Section */}
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '1.5rem', color: '#0f172a' }}>Services</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>AI Mock Interviews</a></li>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Expert Coaching</a></li>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Resume Review</a></li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '1.5rem', color: '#0f172a' }}>Contact</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="mailto:hello@confido.com" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> Email Us</a></li>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Help Center</a></li>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Support Chat</a></li>
                    </ul>
                </div>

                {/* Links Section */}
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '1.5rem', color: '#0f172a' }}>Links</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a></li>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a></li>
                        <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Cookie Policy</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    © {new Date().getFullYear()} Confido. All rights reserved.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Privacy</a>
                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Terms</a>
                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Cookies</a>
                </div>
            </div>
        </footer>
    );
}
