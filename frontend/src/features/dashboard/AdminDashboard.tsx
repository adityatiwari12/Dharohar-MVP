import { useState, useEffect } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { getPendingLicenses, approveLicense, rejectLicense, requestModification } from '../../services/licenseService';
import type { License } from '../../services/licenseService';
import { Loader } from '../../components/Loader/Loader';
import notificationSound from '../../assets/Notification_Sound.wav';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adminComments, setAdminComments] = useState<Record<string, string>>({});
    const [actionError, setActionError] = useState<Record<string, string>>({});

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingLicenses();
            setLicenses(data);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load license requests. Is the server running?');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleApprove = async (id: string) => {
        setIsActioning(true);
        try {
            await approveLicense(id);
            const audio = new Audio(notificationSound);
            audio.play().catch(e => console.error('Audio playback failed', e));
            setLicenses(prev => prev.filter(l => l._id !== id));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || 'Approval failed' }));
        } finally {
            setIsActioning(false);
        }
    };

    const handleReject = async (id: string) => {
        const comment = adminComments[id] || '';
        if (!comment.trim()) {
            setActionError(prev => ({ ...prev, [id]: 'A comment is required to reject an application.' }));
            return;
        }
        setIsActioning(true);
        try {
            await rejectLicense(id, comment);
            setLicenses(prev => prev.filter(l => l._id !== id));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || 'Rejection failed' }));
        } finally {
            setIsActioning(false);
        }
    };

    const handleRequestModification = async (id: string) => {
        const comment = adminComments[id] || '';
        if (!comment.trim()) {
            setActionError(prev => ({ ...prev, [id]: 'A comment explaining the required modification is mandatory.' }));
            return;
        }
        try {
            await requestModification(id, comment);
            setLicenses(prev => prev.filter(l => l._id !== id));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || 'Failed to send modification request' }));
        }
    };

    return (
        <div className="admin-dashboard">
            {isActioning && <Loader label="Processing decision..." />}
            <header className="dashboard-header-inner">
                <h3>License Requests</h3>
                <p>Govern commercial and research access to cultural archives. All decisions are enforced server-side.</p>
            </header>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                    Loading license requests...
                </div>
            )}

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className="request-list">
                {!isLoading && !error && licenses.length === 0 && (
                    <div className="empty-state">
                        <p>No pending license requests at this time.</p>
                    </div>
                )}

                {licenses.map(license => {
                    const asset = typeof license.assetId === 'object' ? license.assetId : null;
                    const applicant = typeof license.applicantId === 'object' ? license.applicantId : null;

                    return (
                        <div key={license._id} className="request-card framed-section">
                            <div className="request-header">
                                <div className="applicant-info">
                                    <h4>{applicant?.name || 'Unknown Applicant'}</h4>
                                    <span className="request-date">{applicant?.email}</span>
                                    <span className="request-date">Applied: {new Date(license.createdAt).toLocaleDateString('en-IN')}</span>
                                </div>
                                <StatusBadge status={license.status} />
                            </div>

                            <div className="request-body">
                                <div className="asset-context">
                                    <strong>Requested Asset:</strong> {asset?.title || 'N/A'}
                                    <span className="community-ref">({asset?.communityName})</span>
                                </div>

                                {/* Media preview for admin — always visible */}
                                {(asset as any)?.mediaUrl && (
                                    <div style={{ margin: '0.75rem 0', padding: '0.75rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-muted-gold)', borderRadius: '2px' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
                                            {(asset as any)?.type === 'SONIC' ? '🎵 Listen to Asset:' : '🎙 Voice Archive:'}
                                        </p>
                                        {(asset as any).mediaUrl.match(/\.(mp4|webm|ogv)$/i) ? (
                                            <video controls style={{ width: '100%', maxHeight: '160px', borderRadius: '2px', background: '#000' }} src={(asset as any).mediaUrl} />
                                        ) : (
                                            <audio controls style={{ width: '100%' }} src={(asset as any).mediaUrl} />
                                        )}
                                    </div>
                                )}

                                <div className="intended-use-badge">
                                    <strong>License Type:</strong> {license.licenseType.replace('_', ' ')}
                                </div>

                                <div className="justification-box">
                                    <strong>Purpose:</strong>
                                    <p>{license.purpose}</p>
                                </div>

                                {license.documentation && (
                                    <div className="justification-box">
                                        <strong>Documentation:</strong>
                                        <p>{license.documentation}</p>
                                    </div>
                                )}

                                {/* Admin comment input — required for Reject and Modification */}
                                <div style={{ marginTop: '1.25rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                        Admin Comment <span style={{ color: '#ef4444' }}>*Required for Reject / Modification</span>
                                    </label>
                                    <textarea
                                        placeholder="Provide feedback, rejection reason, or describe what needs to be changed..."
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', minHeight: '80px' }}
                                        value={adminComments[license._id] || ''}
                                        onChange={e => setAdminComments(prev => ({ ...prev, [license._id]: e.target.value }))}
                                    />
                                </div>

                                {actionError[license._id] && (
                                    <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                        ⚠ {actionError[license._id]}
                                    </p>
                                )}
                            </div>

                            <div className="request-actions">
                                <button className="minimal-btn danger-text" onClick={() => handleReject(license._id)}>
                                    Deny License
                                </button>
                                <button
                                    className="minimal-btn"
                                    onClick={() => handleRequestModification(license._id)}
                                    style={{ borderColor: '#3b82f6', color: '#1e3a5f' }}
                                >
                                    Request Modification
                                </button>
                                <button className="primary-btn" onClick={() => handleApprove(license._id)}>
                                    Approve &amp; Issue Contract
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
