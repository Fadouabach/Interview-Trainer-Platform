import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

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

                {/* Content Sections */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '2rem',
                    flex: 1
                }}>
                    {/* About Section */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '1.25rem', color: '#0f172a' }}>About</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Our Story</Link></li>
                            <li><Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>How It Works</Link></li>
                        </ul>
                    </div>

                    {/* Services Section */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '1.25rem', color: '#0f172a' }}>Services</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link to="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>AI Mock Interviews</Link></li>
                            <li><Link to="/experts" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Expert Coaching</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '1.25rem', color: '#0f172a' }}>Contact</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="mailto:hello@confido.com" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> Email Us</a></li>
                            <li><Link to="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Links Section */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '1.25rem', color: '#0f172a' }}>Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</Link></li>
                            <li><Link to="/terms" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                paddingTop: '2rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    © {new Date().getFullYear()} Confido. All rights reserved.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>Privacy</Link>
                    <Link to="/terms" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>Terms</Link>
                </div>
            </div>
        </footer>
    );
}
