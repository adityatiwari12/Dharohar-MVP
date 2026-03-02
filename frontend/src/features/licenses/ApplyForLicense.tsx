import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { applyForLicense } from '../../services/licenseService';
import { LicenseApplicationDoc } from '../dashboard/LicenseApplicationDoc';
import type { ApplicationData } from '../dashboard/LicenseApplicationDoc';
import { useAuth } from '../auth/AuthContext';

type LicenseType = 'RESEARCH' | 'COMMERCIAL' | 'MEDIA';

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid var(--color-muted-gold)',
    borderRadius: '2px',
    background: 'white',
    fontSize: '0.9rem',
    boxSizing: 'border-box' as const,
    marginBottom: '0',
};

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {children}
    </div>
);

const ResearchForm = ({ data, onChange }: { data: any; onChange: (k: string, v: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.06)', border: '1px solid #3b82f6', borderRadius: '4px', fontSize: '0.85rem' }}>
            🔬 <strong>Research License</strong> — For academic/scientific use. Requires institutional affiliation and IRB/ethics approval.
        </div>
        <Field label="Lead Researcher Full Name" required>
            <input style={inputStyle} required value={data.leadResearcher || ''} onChange={e => onChange('leadResearcher', e.target.value)} placeholder="Dr. Priya Sharma" />
        </Field>
        <Field label="Institution / University Name" required>
            <input style={inputStyle} required value={data.institutionName || ''} onChange={e => onChange('institutionName', e.target.value)} placeholder="IIT Bombay, TISS, etc." />
        </Field>
        <Field label="Research Project Title" required>
            <input style={inputStyle} required value={data.researchTitle || ''} onChange={e => onChange('researchTitle', e.target.value)} placeholder="Study on Warli Ethnobotanical Practices" />
        </Field>
        <Field label="Research Objective" required>
            <textarea style={{ ...inputStyle, minHeight: '80px' }} required value={data.researchObjective || ''} onChange={e => onChange('researchObjective', e.target.value)} placeholder="Describe the academic objective and intended contribution..." />
        </Field>
        <Field label="Detailed Purpose of Use" required>
            <textarea style={{ ...inputStyle, minHeight: '80px' }} required value={data.purpose || ''} onChange={e => onChange('purpose', e.target.value)} placeholder="How specifically will you use this cultural asset in your research?" />
        </Field>
        <Field label="IRB / Ethics Board Reference or Approval Document">
            <input style={inputStyle} value={data.irb_ethics_approval || ''} onChange={e => onChange('irb_ethics_approval', e.target.value)} placeholder="IRB-2024-xxxxx or document URL" />
        </Field>
        <Field label="Expected Research Duration">
            <input style={inputStyle} value={data.expectedDuration || ''} onChange={e => onChange('expectedDuration', e.target.value)} placeholder="e.g. 12 months (Jan 2025 – Dec 2025)" />
        </Field>
        <Field label="Publication / Dissemination Plan">
            <textarea style={{ ...inputStyle, minHeight: '60px' }} value={data.publicationPlan || ''} onChange={e => onChange('publicationPlan', e.target.value)} placeholder="Peer-reviewed journal, conference presentation, open access, etc." />
        </Field>
        <Field label="Supporting Documentation (URL or description)">
            <input style={inputStyle} value={data.documentation || ''} onChange={e => onChange('documentation', e.target.value)} placeholder="Link to your institution letter, ethics cert, etc." />
        </Field>
    </div>
);

const CommercialForm = ({ data, onChange }: { data: any; onChange: (k: string, v: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(251,146,60,0.08)', border: '1px solid #fb923c', borderRadius: '4px', fontSize: '0.85rem' }}>
            🏢 <strong>Commercial License</strong> — For product development, branding, or commercial exploitation. Revenue sharing with the originating community may apply.
        </div>
        <Field label="Company / Organization Name" required>
            <input style={inputStyle} required value={data.companyName || ''} onChange={e => onChange('companyName', e.target.value)} placeholder="Acme Naturals Pvt. Ltd." />
        </Field>
        <Field label="Company Registration Number">
            <input style={inputStyle} value={data.companyRegistration || ''} onChange={e => onChange('companyRegistration', e.target.value)} placeholder="CIN / GST No." />
        </Field>
        <Field label="Product / Service Name" required>
            <input style={inputStyle} required value={data.productName || ''} onChange={e => onChange('productName', e.target.value)} placeholder="Product name using this cultural knowledge" />
        </Field>
        <Field label="Detailed Description of Commercial Use" required>
            <textarea style={{ ...inputStyle, minHeight: '90px' }} required value={data.commercialUseDescription || ''} onChange={e => onChange('commercialUseDescription', e.target.value)} placeholder="Describe exactly how this asset will be used in your product/service..." />
        </Field>
        <Field label="Detailed Purpose" required>
            <textarea style={{ ...inputStyle, minHeight: '70px' }} required value={data.purpose || ''} onChange={e => onChange('purpose', e.target.value)} placeholder="What business need does this fulfill?" />
        </Field>
        <Field label="Expected Annual Revenue from this use">
            <input style={inputStyle} value={data.expectedRevenue || ''} onChange={e => onChange('expectedRevenue', e.target.value)} placeholder="e.g. ₹50 Lakhs – ₹1 Crore" />
        </Field>
        <Field label="Proposed Royalty / Revenue Share with Community">
            <input style={inputStyle} value={data.proposedRoyaltyRate || ''} onChange={e => onChange('proposedRoyaltyRate', e.target.value)} placeholder="e.g. 5% of net revenue" />
        </Field>
        <Field label="Community Benefit Plan">
            <textarea style={{ ...inputStyle, minHeight: '70px' }} value={data.communityBenefitPlan || ''} onChange={e => onChange('communityBenefitPlan', e.target.value)} placeholder="How will the originating community directly benefit?" />
        </Field>
        <Field label="Supporting Documentation (URL or description)">
            <input style={inputStyle} value={data.documentation || ''} onChange={e => onChange('documentation', e.target.value)} placeholder="Company registration docs, business proposal, etc." />
        </Field>
    </div>
);

const MediaForm = ({ data, onChange }: { data: any; onChange: (k: string, v: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(168,85,247,0.06)', border: '1px solid #a855f7', borderRadius: '4px', fontSize: '0.85rem' }}>
            🎬 <strong>Media License</strong> — For films, documentaries, podcasts, journalism, or digital media featuring this sonic cultural asset.
        </div>
        <Field label="Project Title" required>
            <input style={inputStyle} required value={data.projectTitle || ''} onChange={e => onChange('projectTitle', e.target.value)} placeholder="e.g. 'Echoes of the Forest' — Documentary Film" />
        </Field>
        <Field label="Media Type" required>
            <select style={inputStyle} required value={data.mediaType || ''} onChange={e => onChange('mediaType', e.target.value)}>
                <option value="">Select media type...</option>
                <option value="Feature Film">Feature Film</option>
                <option value="Documentary">Documentary</option>
                <option value="Short Film">Short Film</option>
                <option value="Podcast / Audio Series">Podcast / Audio Series</option>
                <option value="Music Album">Music Album</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Digital Content / YouTube">Digital Content / YouTube</option>
                <option value="News / Journalism">News / Journalism</option>
                <option value="Other">Other</option>
            </select>
        </Field>
        <Field label="Distribution Platform" required>
            <input style={inputStyle} required value={data.distributionPlatform || ''} onChange={e => onChange('distributionPlatform', e.target.value)} placeholder="Netflix, YouTube, Spotify, Cinema, etc." />
        </Field>
        <Field label="Detailed Purpose of Use" required>
            <textarea style={{ ...inputStyle, minHeight: '80px' }} required value={data.purpose || ''} onChange={e => onChange('purpose', e.target.value)} placeholder="How will this asset appear / be used in the project?" />
        </Field>
        <Field label="Estimated Audience Reach">
            <input style={inputStyle} value={data.estimatedAudience || ''} onChange={e => onChange('estimatedAudience', e.target.value)} placeholder="e.g. 500,000 viewers, global release" />
        </Field>
        <Field label="Attribution / Crediting Plan" required>
            <textarea style={{ ...inputStyle, minHeight: '60px' }} required value={data.creditingPlan || ''} onChange={e => onChange('creditingPlan', e.target.value)} placeholder="How will the originating community and artists be credited?" />
        </Field>
        <Field label="Supporting Documentation (URL or description)">
            <input style={inputStyle} value={data.documentation || ''} onChange={e => onChange('documentation', e.target.value)} placeholder="Project brief, broadcaster letter, press credentials, etc." />
        </Field>
    </div>
);

export const ApplyForLicense = () => {
    const { assetId } = useParams<{ assetId: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const assetTitle = searchParams.get('title') || 'Cultural Asset';
    const assetType = searchParams.get('assetType') || 'BIO';
    const communityName = searchParams.get('community') || '';
    const navigate = useNavigate();

    const defaultType: LicenseType = assetType === 'SONIC' ? 'MEDIA' : 'RESEARCH';
    const [licenseType, setLicenseType] = useState<LicenseType>(defaultType);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<ApplicationData | null>(null);

    const userName = user?.email?.split('@')[0] || 'Applicant';
    const userEmail = user?.email || '';

    const handleFieldChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Build ApplicationData from the current form state
    const buildDocData = (): ApplicationData => ({
        applicantName: formData.leadResearcher || formData.companyName || userName,
        organizationName: formData.institutionName || formData.companyName || '',
        email: userEmail,
        phone: formData.phone || '',
        address: formData.address || '',
        assetTitle,
        communityName: communityName || 'Originating Community',
        licenseType,
        purpose: formData.purpose || formData.commercialUseDescription || '',
        duration: formData.expectedDuration || '1 year',
        documentation: formData.documentation || '',
        signedDate: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.purpose?.trim()) {
            setError('Please fill in the "Purpose" field.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await applyForLicense({
                assetId: assetId!,
                licenseType,
                purpose: formData.purpose,
                documentation: formData.documentation,
                ...Object.fromEntries(
                    Object.entries(formData).filter(([k]) => k !== 'purpose' && k !== 'documentation')
                )
            } as any);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Success screen ──
    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="framed-section" style={{ maxWidth: 520, textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3>License Application Submitted</h3>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        Your <strong>{licenseType}</strong> license application for <em>{assetTitle}</em> has been received and is now under admin review.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                        You'll be notified of the decision. Track your applications in your dashboard.
                    </p>

                    {/* Download document on success too */}
                    <div style={{
                        margin: '1.5rem 0',
                        padding: '1rem 1.25rem',
                        background: 'rgba(176,141,87,0.08)',
                        border: '1px solid var(--color-muted-gold)',
                        borderRadius: '6px',
                        textAlign: 'left',
                    }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', margin: '0 0 0.75rem', fontWeight: 600 }}>
                            📄 Want a copy of your application?
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: '0 0 0.75rem' }}>
                            Download a branded PDF copy of your license application for your records.
                        </p>
                        <button
                            type="button"
                            className="minimal-btn"
                            style={{ fontSize: '0.85rem' }}
                            onClick={() => setPreviewDoc(buildDocData())}
                        >
                            ⬇ Preview & Download Application Document
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="primary-btn" onClick={() => navigate('/dashboard/licenses/mine')}>
                            View My Applications
                        </button>
                        <button className="minimal-btn" onClick={() => navigate('/marketplace')}>
                            Back to Marketplace
                        </button>
                    </div>
                </div>

                {previewDoc && (
                    <LicenseApplicationDoc data={previewDoc} onClose={() => setPreviewDoc(null)} />
                )}
            </div>
        );
    }

    // ── Main form ──
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-parchment)', padding: '3rem 2rem' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <button className="minimal-btn" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }} onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <div className="framed-section" style={{ padding: '2rem' }}>
                    <h2 style={{ marginTop: 0 }}>License Application</h2>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        Applying for: <strong>{assetTitle}</strong>
                        {communityName && <span> — <em>{communityName}</em></span>}
                    </p>

                    {/* License type selector */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', marginTop: '0.5rem' }}>
                        {assetType === 'BIO' && (
                            <>
                                <button
                                    type="button"
                                    className={licenseType === 'RESEARCH' ? 'primary-btn' : 'minimal-btn'}
                                    onClick={() => setLicenseType('RESEARCH')}
                                >
                                    🔬 Research License
                                </button>
                                <button
                                    type="button"
                                    className={licenseType === 'COMMERCIAL' ? 'primary-btn' : 'minimal-btn'}
                                    onClick={() => setLicenseType('COMMERCIAL')}
                                >
                                    🏢 Commercial License
                                </button>
                            </>
                        )}
                        {assetType === 'SONIC' && (
                            <button type="button" className="primary-btn">
                                🎬 Media License
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {licenseType === 'RESEARCH' && <ResearchForm data={formData} onChange={handleFieldChange} />}
                        {licenseType === 'COMMERCIAL' && <CommercialForm data={formData} onChange={handleFieldChange} />}
                        {licenseType === 'MEDIA' && <MediaForm data={formData} onChange={handleFieldChange} />}

                        {error && (
                            <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', fontSize: '0.85rem' }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* ── Document Preview + Submit row ── */}
                        <div style={{
                            marginTop: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid var(--color-muted-gold)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                        }}>
                            {/* Document generation tip */}
                            <div style={{
                                padding: '0.9rem 1.1rem',
                                background: 'rgba(176,141,87,0.06)',
                                border: '1px solid var(--color-muted-gold)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                flexWrap: 'wrap',
                            }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-burnt-umber)' }}>
                                        📄 Generate Application Document
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                                        Preview and download a DHAROHAR-branded PDF of your application before or after submitting.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="minimal-btn"
                                    style={{ fontSize: '0.82rem', flexShrink: 0 }}
                                    onClick={() => setPreviewDoc(buildDocData())}
                                >
                                    Preview Document →
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={isSubmitting}
                                style={{ padding: '0.9rem', fontSize: '1rem' }}
                            >
                                {isSubmitting ? 'Submitting Application...' : 'Submit License Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {previewDoc && (
                <LicenseApplicationDoc data={previewDoc} onClose={() => setPreviewDoc(null)} />
            )}
        </div>
    );
};
