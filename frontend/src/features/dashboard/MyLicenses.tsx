import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { getMyLicenses, resubmitLicense } from '../../services/licenseService';
import type { License, ResubmitPayload } from '../../services/licenseService';

export const MyLicenses = () => {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resubmitData, setResubmitData] = useState<Record<string, ResubmitPayload>>({});
    const [submitError, setSubmitError] = useState<Record<string, string>>({});
    const [submitSuccess, setSubmitSuccess] = useState<Record<string, string>>({});

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await getMyLicenses();
            setLicenses(data);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load your applications. Is the server running?');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleResubmit = async (id: string) => {
        const payload = resubmitData[id];
        if (!payload?.purpose?.trim()) {
            setSubmitError(prev => ({ ...prev, [id]: 'Please update the purpose field before resubmitting.' }));
            return;
        }
        try {
            const updated = await resubmitLicense(id, payload);
            setLicenses(prev => prev.map(l => l._id === id ? { ...l, ...updated } : l));
            setSubmitSuccess(prev => ({ ...prev, [id]: 'Application resubmitted successfully. It is now pending admin review.' }));
            setSubmitError(prev => ({ ...prev, [id]: '' }));
        } catch (e: any) {
            setSubmitError(prev => ({ ...prev, [id]: e.response?.data?.message || 'Resubmission failed' }));
        }
    };

    return (
        <DashboardLayout title="My License Applications">
            <div style={{ animation: 'fadeIn var(--transition-base)' }}>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                    Track the status of your license applications. If a modification is requested, you can edit and resubmit below.
                </p>

                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>Loading applications...</div>
                )}

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {!isLoading && !error && licenses.length === 0 && (
                    <div className="no-data">No license applications found. Browse the Marketplace to apply for a license.</div>
                )}

                <div className="audio-list">
                    {licenses.map(license => {
                        const asset = typeof license.assetId === 'object' ? license.assetId : null;
                        const isModRequired = license.status === 'MODIFICATION_REQUIRED';

                        return (
                            <div key={license._id} className="framed-section" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>
                                            {asset?.title || 'Cultural Asset'}
                                        </h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                            {asset?.communityName} • {license.licenseType} License •{' '}
                                            Applied: {new Date(license.createdAt).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                    <StatusBadge status={license.status} />
                                </div>

                                {/* Purpose */}
                                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-muted-gold)', borderRadius: '2px' }}>
                                    <strong style={{ fontSize: '0.85rem' }}>Purpose:</strong>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{license.purpose}</p>
                                </div>

                                {/* Approved: show agreement text */}
                                {license.status === 'APPROVED' && license.agreementText && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.06)', border: '1px solid #22c55e', borderRadius: '4px' }}>
                                        <strong style={{ fontSize: '0.85rem', color: '#14532d' }}>📜 License Agreement Issued:</strong>
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{license.agreementText}</p>
                                    </div>
                                )}

                                {/* Rejected: show comment */}
                                {license.status === 'REJECTED' && license.adminComment && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid #ef4444', borderRadius: '4px' }}>
                                        <strong style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>Rejection Reason:</strong>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{license.adminComment}</p>
                                    </div>
                                )}

                                {/* Modification required: show comment + edit form */}
                                {isModRequired && (
                                    <>
                                        {license.adminComment && (
                                            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.06)', border: '1px solid #3b82f6', borderRadius: '4px' }}>
                                                <strong style={{ fontSize: '0.85rem', color: '#1e3a5f' }}>Modification Requested by Admin:</strong>
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{license.adminComment}</p>
                                            </div>
                                        )}

                                        {/* Edit form */}
                                        <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(59,130,246,0.04)', border: '1px dashed #3b82f6', borderRadius: '4px' }}>
                                            <h5 style={{ margin: '0 0 1rem', color: '#1e3a5f' }}>✏️ Edit &amp; Resubmit Application</h5>

                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                                Updated Purpose <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <textarea
                                                placeholder="Describe the updated purpose of your license application..."
                                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #3b82f6', borderRadius: '2px', marginBottom: '0.75rem', minHeight: '80px' }}
                                                defaultValue={license.purpose}
                                                onChange={e => setResubmitData(prev => ({ ...prev, [license._id]: { ...prev[license._id], purpose: e.target.value } }))}
                                            />

                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                                Updated Documentation
                                            </label>
                                            <textarea
                                                placeholder="Link or description of supporting documentation..."
                                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', marginBottom: '1rem', minHeight: '60px' }}
                                                defaultValue={license.documentation || ''}
                                                onChange={e => setResubmitData(prev => ({ ...prev, [license._id]: { ...prev[license._id], documentation: e.target.value } }))}
                                            />

                                            {submitError[license._id] && (
                                                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                    ⚠ {submitError[license._id]}
                                                </p>
                                            )}
                                            {submitSuccess[license._id] && (
                                                <p style={{ color: '#14532d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                    ✅ {submitSuccess[license._id]}
                                                </p>
                                            )}

                                            <button
                                                className="primary-btn"
                                                onClick={() => handleResubmit(license._id)}
                                            >
                                                Resubmit Application
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};
