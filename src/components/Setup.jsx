import React, { useState } from 'react';
import { ArrowRight, Search, Briefcase } from 'lucide-react';
import { categoryMeta } from '../data/questions';

export function Setup({ onStart }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Convert metadata object to array for easier filtering
    const categoriesList = Object.entries(categoryMeta).map(([id, meta]) => ({
        id,
        ...meta
    }));

    const filteredCategories = categoriesList.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '1000px', margin: '2rem auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Path</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Select a job role or topic to begin your mock interview session.
            </p>

            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search for a job role (e.g. 'Marketing', 'Java')..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '50px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                />
            </div>

            {filteredCategories.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>
                    <p>No categories found matching "{searchTerm}"</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {filteredCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onStart(cat.id)}
                            className="glass-panel"
                            style={{
                                padding: '2rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.03)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                alignItems: 'flex-start'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                        >
                            <div style={{
                                background: 'var(--bg-dark)',
                                padding: '1rem',
                                borderRadius: '50%',
                                marginBottom: '1rem',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <Briefcase color="var(--primary)" size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{cat.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'auto', lineHeight: '1.4' }}>{cat.desc}</p>

                            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                                Start Interview <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
