import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Briefcase, UserPlus, ArrowRight, ArrowLeft, Upload, Link as LinkIcon, CheckCircle2, Globe, Github, Linkedin, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export function Signup({ setView }) {
    const [step, setStep] = useState(1); // 1: Role, 2: Account, 3: Expert Details
    const [role, setRole] = useState('user'); // 'user' or 'expert'
    
    // Account details (Common)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Expert details
    const [domain, setDomain] = useState('');
    const [bio, setBio] = useState('');
    const [experience, setExperience] = useState('');
    const [skills, setSkills] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [github, setGithub] = useState('');
    const [portfolio, setPortfolio] = useState('');
    const [cv, setCv] = useState(null);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (step === 2 && role === 'expert') {
            setStep(3);
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', role);

            if (role === 'expert') {
                formData.append('domain', domain);
                formData.append('bio', bio);
                formData.append('experience', experience);
                formData.append('skills', JSON.stringify(skills.split(',').map(s => s.trim())));
                formData.append('linkedinUrl', linkedin);
                formData.append('githubUrl', github);
                formData.append('portfolioUrl', portfolio);
                if (cv) formData.append('cv', cv);
            }

            const res = await register(formData);
            if (!res.success) {
                setError(res.message);
            } else {
                if (res.user?.role === 'admin') navigate('/admin/dashboard', { replace: true });
                else if (res.user?.role === 'expert') navigate('/expert/dashboard', { replace: true });
                else navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1) setStep(2);
        else if (step === 2 && role === 'expert') setStep(3);
    };

    const prevStep = () => {
        if (step === 2) setStep(1);
        else if (step === 3) setStep(2);
    };

    const ProgressIndicator = () => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {[1, 2, role === 'expert' ? 3 : null].filter(Boolean).map((s) => (
                <div key={s} style={{
                    height: '4px', width: '40px', borderRadius: '4px',
                    backgroundColor: step >= s ? 'var(--primary)' : 'var(--border-subtle)',
                    transition: 'background-color 0.3s'
                }} />
            ))}
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-app)', padding: '2rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: step === 3 ? '600px' : '450px', padding: '2.5rem', transition: 'max-width 0.3s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src={logo} alt="Confido" style={{ height: '50px', marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {step === 1 ? 'Choose Your Path' : step === 2 ? 'Create Your Account' : 'Expert Profile Setup'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {step === 1 ? 'Select how you want to use the platform' : 
                         step === 2 ? "Just a few more details to get you started" : 
                         "Help us understand your expertise"}
                    </p>
                </div>

                <ProgressIndicator />

                {error && (
                    <div style={{
                        background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem 1rem',
                        borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem',
                        border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <div style={{ width: '4px', height: '100%', background: '#dc2626', borderRadius: '2px' }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* STEP 1: Role Selection */}
                    {step === 1 && (
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div 
                                onClick={() => setRole('user')}
                                style={{
                                    padding: '1.5rem', borderRadius: '16px', border: `2px solid ${role === 'user' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                                    cursor: 'pointer', transition: 'all 0.2s', background: role === 'user' ? '#f0f7ff' : 'white',
                                    display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative'
                                }}
                            >
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '12px', background: role === 'user' ? 'var(--primary)' : '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: role === 'user' ? 'white' : '#64748b'
                                }}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Regular User</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Practice interviews with AI and feedback</div>
                                </div>
                                {role === 'user' && <CheckCircle2 size={20} color="var(--primary)" style={{ position: 'absolute', right: '1.5rem' }} />}
                            </div>

                            <div 
                                onClick={() => setRole('expert')}
                                style={{
                                    padding: '1.5rem', borderRadius: '16px', border: `2px solid ${role === 'expert' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                                    cursor: 'pointer', transition: 'all 0.2s', background: role === 'expert' ? '#f0f7ff' : 'white',
                                    display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative'
                                }}
                            >
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '12px', background: role === 'expert' ? 'var(--primary)' : '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: role === 'expert' ? 'white' : '#64748b'
                                }}>
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Industry Expert</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Offer mentorship and conduct mock interviews</div>
                                </div>
                                {role === 'expert' && <CheckCircle2 size={20} color="var(--primary)" style={{ position: 'absolute', right: '1.5rem' }} />}
                            </div>

                            <button type="button" onClick={nextStep} className="btn" style={{ width: '100%', marginTop: '1rem', height: '52px' }}>
                                Continue <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Account Details */}
                    {step === 2 && (
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-light)' }} />
                                    <input
                                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                        placeholder="John Doe" required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-light)' }} />
                                    <input
                                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                        placeholder="john@example.com" required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-light)' }} />
                                    <input
                                        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                        placeholder="••••••••" required minLength={6}
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Must be at least 6 characters</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={prevStep} style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button type="submit" className="btn" style={{ flex: 2, height: '52px' }} disabled={isLoading}>
                                    {isLoading ? 'Processing...' : role === 'expert' ? 'Next: Profile Setup' : 'Create Account'}
                                    {!isLoading && <ArrowRight size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Expert Details */}
                    {step === 3 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Domain / Specialization</label>
                                <input
                                    type="text" value={domain} onChange={(e) => setDomain(e.target.value)}
                                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                    placeholder="e.g. Fullstack Development, Cloud Architecture" required
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Short Bio</label>
                                <textarea
                                    value={bio} onChange={(e) => setBio(e.target.value)}
                                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none', minHeight: '80px', fontFamily: 'inherit' }}
                                    placeholder="Tell candidates about your background and achievements..." required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Years of Experience</label>
                                <input
                                    type="text" value={experience} onChange={(e) => setExperience(e.target.value)}
                                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                    placeholder="e.g. 8 years" required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Skills (Comma separated)</label>
                                <input
                                    type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
                                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                    placeholder="React, Node.js, AWS" required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>LinkedIn Profile</label>
                                <div style={{ position: 'relative' }}>
                                    <Linkedin size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
                                    <input
                                        type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                        placeholder="https://linkedin.com/..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Portfolio URL</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
                                    <input
                                        type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Upload CV (PDF)</label>
                                <div style={{
                                    border: '2px dashed var(--border-subtle)', borderRadius: '12px', padding: '1.5rem',
                                    textAlign: 'center', cursor: 'pointer', background: 'var(--bg-app)'
                                }} onClick={() => document.getElementById('cv-upload').click()}>
                                    <Upload size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cv ? cv.name : 'Click to upload your CV'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maximum file size: 5MB</div>
                                    <input 
                                        type="file" id="cv-upload" hidden accept=".pdf" 
                                        onChange={(e) => setCv(e.target.files[0])}
                                    />
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={prevStep} style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel)', cursor: 'pointer', fontWeight: 600 }}>
                                    Back
                                </button>
                                <button type="submit" className="btn" style={{ flex: 2, height: '52px' }} disabled={isLoading}>
                                    {isLoading ? 'Creating Profile...' : 'Complete Expert Registration'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Already have an account?</span>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary)',
                            fontWeight: '700', cursor: 'pointer', marginLeft: '0.5rem'
                        }}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
