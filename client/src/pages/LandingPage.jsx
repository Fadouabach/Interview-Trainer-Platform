import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Play, Mic, FileText, ArrowRight, Star } from 'lucide-react';
import logo from '../assets/logo.png';

export function LandingPage() {
    return (
        <div style={{ fontFamily: '"Inter", sans-serif', background: '#ffffff', color: '#1e293b' }}>
            {/* Navbar */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                    <img src={logo} alt="Confido Logo" style={{ height: '40px' }} />
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <a href="#features" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Features</a>
                    <a href="#experts" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Experts</a>
                    <Link to="/login" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '600' }}>Sign In</Link>
                    <Link to="/signup" className="btn" style={{ textDecoration: 'none', background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600' }}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ textAlign: 'center', padding: '6rem 2rem', background: 'radial-gradient(circle at top, #f1f5f9 0%, transparent 40%)' }}>
                <div style={{
                    display: 'inline-block', padding: '0.5rem 1rem', background: '#eff6ff', color: '#3b82f6',
                    borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem'
                }}>
                    ✨ AI-Powered Interview Coach
                </div>
                <h1 style={{ fontSize: '4rem', fontWeight: '800', maxWidth: '800px', margin: '0 auto 1.5rem auto', lineHeight: '1.1', letterSpacing: '-0.02em', color: '#0f172a' }}>
                    Master Your Next Interview with <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real-Time AI Feedback</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
                    Practice with realistic questions, get instant transcription analysis, and boost your confidence before the big day.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/dashboard" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: '#0f172a', color: 'white', padding: '1rem 2rem',
                        borderRadius: '12px', fontWeight: '600', textDecoration: 'none', fontSize: '1.1rem',
                        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)'
                    }}>
                        Start Practicing Now <ArrowRight size={20} />
                    </Link>
                    <a href="#demo" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'white', color: '#0f172a', padding: '1rem 2rem',
                        borderRadius: '12px', fontWeight: '600', textDecoration: 'none', fontSize: '1.1rem',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Play size={20} /> Watch Demo
                    </a>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#0f172a' }}>Everything you need to succeed</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Our platform provides comprehensive tools to prepare you for any role.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <FeatureCard
                        icon={<Mic size={32} color="#3b82f6" />}
                        title="Speech Analysis"
                        description="Our AI analyzes your tone, pace, and clarity to ensure you sound confident and professional."
                    />
                    <FeatureCard
                        icon={<FileText size={32} color="#8b5cf6" />}
                        title="Content Reviews"
                        description="Get detailed feedback on the structure and quality of your answers tailored to the job description."
                    />
                    <FeatureCard
                        icon={<CheckCircle size={32} color="#10b981" />}
                        title="Readiness Score"
                        description="Track your progress with a dynamic readiness score that tells you exactly when you're prepared."
                    />
                </div>
            </section>

            {/* Experts Preview */}
            <section id="experts" style={{ background: '#f8fafc', padding: '6rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#0f172a' }}>Learn from the best</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Book 1:1 sessions with industry veterans from top companies.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <ExpertCard name="Jihane K." company="Ex-Google" role="Frontend Expert" />
                        <ExpertCard name="Kareem L." company="Amazon" role="Backend Lead" />
                        <ExpertCard name="Sarah M." company="Spotify" role="Product Designer" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#0f172a', color: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
                <img src={logo} alt="Confido" style={{ height: '50px', marginBottom: '2rem', filter: 'brightness(0) invert(1)' }} />
                <div style={{ color: '#94a3b8', marginBottom: '2rem' }}>© 2026 Confido Inc. All rights reserved.</div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div style={{ padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white' }}>
            <div style={{ marginBottom: '1.5rem' }}>{icon}</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0f172a' }}>{title}</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{description}</p>
        </div>
    );
}

function ExpertCard({ name, company, role }) {
    return (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{company}</div>
                </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                <Star size={12} fill="currentColor" /> {role}
            </div>
        </div>
    );
}
