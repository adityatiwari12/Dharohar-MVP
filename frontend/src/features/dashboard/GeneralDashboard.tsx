import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getMyLicenses } from '../../services/licenseService';
import type { License } from '../../services/licenseService';
import { LicensingInfoSection } from '../marketplace/LicensingInfoSection';
import { LicenseApplicationDoc } from './LicenseApplicationDoc';
import type { ApplicationData } from './LicenseApplicationDoc';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── Application Form ── */
interface AppFormProps {
    userName: string;
    userEmail: string;
    onPreview: (data: ApplicationData) => void;
}

const ApplicationForm = ({ userName, userEmail, onPreview }: AppFormProps) => {
    const [assetTitle, setAssetTitle] = useState('');
    const [communityName, setCommunity] = useState('');
    const [licenseType, setLicenseType] = useState('RESEARCH');
    const [org, setOrg] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [purpose, setPurpose] = useState('');
    const [duration, setDuration] = useState('1 year');
    const [documentation, setDocumentation] = useState('');
    const [error, setError] = useState('');

    const fieldStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        border: '1px solid var(--color-muted-gold)',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        background: '#fff',
        color: 'var(--color-text-main)',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--color-text-light)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '4px',
    };

    const half: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    };

    const handleGenerate = () => {
        setError('');
        if (!assetTitle.trim() || !communityName.trim() || !purpose.trim()) {
            setError('Please fill in Asset Title, Community Name, and Purpose.');
            return;
        }
        onPreview({
            applicantName: userName,
            organizationName: org,
            email: userEmail,
            phone,
            address,
            assetTitle,
            communityName,
            licenseType,
            purpose,
            duration,
            documentation,
            signedDate: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }),
        });
    };

    return (
        <div style={{
            padding: '1.75rem',
            background: 'rgba(176,141,87,0.04)',
            border: '1px solid var(--color-muted-gold)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem',
        }}>
            <div style={half}>
                <div>
                    <label style={labelStyle}>Asset Title <span style={{ color: '#ef4444' }}>*</span></label>
                    <input style={fieldStyle} value={assetTitle} onChange={e => setAssetTitle(e.target.value)} placeholder="e.g. Warli Tribal Art" />
                </div>
                <div>
                    <label style={labelStyle}>Community of Origin <span style={{ color: '#ef4444' }}>*</span></label>
                    <input style={fieldStyle} value={communityName} onChange={e => setCommunity(e.target.value)} placeholder="e.g. Warli Tribe, Maharashtra" />
                </div>
            </div>

            <div>
                <label style={labelStyle}>License Type</label>
                <select style={fieldStyle} value={licenseType} onChange={e => setLicenseType(e.target.value)}>
                    <option value="RESEARCH">🎓 Research License — Academic use</option>
                    <option value="COMMERCIAL">💼 Commercial License — Product development</option>
                    <option value="MEDIA">🎬 Media License — Film, TV, Content</option>
                    <option value="MUSIC">🎵 Commercial Music License — Labels, Streaming</option>
                </select>
            </div>

            <div style={half}>
                <div>
                    <label style={labelStyle}>Your Name (auto-filled)</label>
                    <input style={{ ...fieldStyle, background: '#f5f5f5', color: '#888' }} value={userName} readOnly />
                </div>
                <div>
                    <label style={labelStyle}>Email (auto-filled)</label>
                    <input style={{ ...fieldStyle, background: '#f5f5f5', color: '#888' }} value={userEmail} readOnly />
                </div>
            </div>

            <div style={half}>
                <div>
                    <label style={labelStyle}>Organization / Institution</label>
                    <input style={fieldStyle} value={org} onChange={e => setOrg(e.target.value)} placeholder="e.g. Delhi University" />
                </div>
                <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={fieldStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
            </div>

            <div>
                <label style={labelStyle}>Full Address</label>
                <input style={fieldStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, State, PIN Code" />
            </div>

            <div>
                <label style={labelStyle}>Purpose of License <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea
                    style={{ ...fieldStyle, minHeight: '90px', resize: 'vertical' }}
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="Describe clearly why and how you will use this cultural asset..."
                />
            </div>

            <div style={half}>
                <div>
                    <label style={labelStyle}>Requested Duration</label>
                    <select style={fieldStyle} value={duration} onChange={e => setDuration(e.target.value)}>
                        <option value="1 year">1 year</option>
                        <option value="2 years">2 years</option>
                        <option value="3 years">3 years</option>
                        <option value="5 years">5 years</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Supporting Documentation</label>
                    <input style={fieldStyle} value={documentation} onChange={e => setDocumentation(e.target.value)} placeholder="Link or reference" />
                </div>
            </div>

            {error && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>⚠ {error}</p>
            )}

            <button
                type="button"
                className="primary-btn"
                onClick={handleGenerate}
                style={{ alignSelf: 'flex-start', padding: '0.7rem 2rem', fontSize: '0.95rem' }}
            >
                Preview & Download Application Document →
            </button>
        </div>
    );
};

/* ── Main Component ── */
export const GeneralDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [previewData, setPreviewData] = useState<ApplicationData | null>(null);
    const [showDocForm, setShowDocForm] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [guideType, setGuideType] = useState<'BIO' | 'SONIC'>('BIO');

    useEffect(() => {
        getMyLicenses().then(data => setLicenses(data)).catch(() => { });
    }, []);

    const userName = user?.email?.split('@')[0] || 'Applicant';
    const userEmail = user?.email || '';

    const approved = licenses.filter(l => l.status === 'APPROVED').length;
    const pending = licenses.filter(l => l.status === 'PENDING').length;

    return (
        <DashboardLayout title="My Dashboard">
            <div style={{ animation: 'fadeIn var(--transition-base)' }}>

                {/* ── Welcome Banner ── */}
                <div style={{
                    padding: '1.5rem 2rem',
                    background: 'linear-gradient(135deg, rgba(161,75,59,0.08) 0%, rgba(176,141,87,0.12) 100%)',
                    border: '1px solid var(--color-muted-gold)',
                    borderRadius: '8px',
                    borderLeft: '5px solid var(--color-terracotta)',
                    marginBottom: '2rem',
                }}>
                    <h3 style={{ margin: '0 0 0.4rem', color: 'var(--color-burnt-umber)' }}>
                        Welcome, {userName} 👋
                    </h3>
                    <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                        You are logged in as a <strong>General User</strong>. From here you can explore licensing options, generate application documents, and track your submissions.
                    </p>
                </div>

                {/* ── Quick Stats ── */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                    {[
                        { icon: '📋', label: 'Total Applications', value: licenses.length, link: '/dashboard/licenses/mine' },
                        { icon: '✅', label: 'Approved', value: approved, link: '/dashboard/licenses/mine' },
                        { icon: '⏳', label: 'Pending Review', value: pending, link: '/dashboard/licenses/mine' },
                        { icon: '🏛️', label: 'Marketplace', value: '→', link: '/marketplace' },
                    ].map(stat => (
                        <div
                            key={stat.label}
                            onClick={() => navigate(stat.link)}
                            style={{
                                flex: '1',
                                minWidth: '140px',
                                padding: '1.25rem',
                                background: 'var(--color-bg-light)',
                                border: '1px solid var(--color-muted-gold)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-terracotta)', lineHeight: 1 }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Generate Application Document ── */}
                <div className="framed-section" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burnt-umber)', margin: '0 0 0.35rem' }}>
                                📃 Generate License Application Document
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.88rem', margin: 0 }}>
                                Create a formal, branded PDF application to submit to the community for any cultural asset from the marketplace.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="minimal-btn"
                            onClick={() => setShowDocForm(v => !v)}
                            style={{ flexShrink: 0 }}
                        >
                            {showDocForm ? '▲ Close Form' : '+ Create Application'}
                        </button>
                    </div>

                    {!showDocForm && (
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            {[
                                { icon: '🎓', label: 'Research License', color: '#4CAF50' },
                                { icon: '💼', label: 'Commercial License', color: '#FF9800' },
                                { icon: '🎬', label: 'Media License', color: '#9C27B0' },
                                { icon: '🎵', label: 'Music License', color: '#F44336' },
                            ].map(t => (
                                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                                    <span>{t.icon}</span>
                                    <span style={{ color: t.color, fontWeight: 600 }}>{t.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {showDocForm && (
                        <div style={{ marginTop: '1.25rem' }}>
                            <ApplicationForm
                                userName={userName}
                                userEmail={userEmail}
                                onPreview={setPreviewData}
                            />
                        </div>
                    )}
                </div>

                {/* ── Licensing Guide ── */}
                <div className="framed-section" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burnt-umber)', margin: '0 0 0.35rem' }}>
                                📖 Licensing Framework Guide
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.88rem', margin: 0 }}>
                                Understand all 4 license types — what you can do, fees, community benefit shares, and legal framework.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="minimal-btn"
                            onClick={() => setShowGuide(v => !v)}
                            style={{ flexShrink: 0 }}
                        >
                            {showGuide ? '▲ Hide Guide' : '▼ Explore Licenses'}
                        </button>
                    </div>

                    {showGuide && (
                        <div>
                            {/* Type toggle */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                                {(['BIO', 'SONIC'] as const).map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setGuideType(t)}
                                        style={{
                                            padding: '6px 20px',
                                            borderRadius: '20px',
                                            border: `1.5px solid ${guideType === t ? 'var(--color-terracotta)' : 'var(--color-muted-gold)'}`,
                                            background: guideType === t ? 'var(--color-terracotta)' : 'transparent',
                                            color: guideType === t ? '#fff' : 'var(--color-text-main)',
                                            fontWeight: 600,
                                            fontSize: '0.82rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {t === 'BIO' ? '🌿 Biological Knowledge' : '🎶 Sonic Heritage'}
                                    </button>
                                ))}
                            </div>

                            <LicensingInfoSection
                                assetType={guideType}
                                onApply={() => navigate('/marketplace')}
                            />
                        </div>
                    )}

                    {!showGuide && (
                        <Link to="/licensing-guide" style={{ fontSize: '0.82rem', color: 'var(--color-terracotta)', fontWeight: 600, textDecoration: 'none' }}>
                            View full licensing guide →
                        </Link>
                    )}
                </div>

            </div>

            {/* ── PDF Preview Modal ── */}
            {previewData && (
                <LicenseApplicationDoc
                    data={previewData}
                    onClose={() => setPreviewData(null)}
                />
            )}
        </DashboardLayout>
    );
};
