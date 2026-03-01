import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { getMyAssets } from '../../services/assetService';
import type { Asset } from '../../services/assetService';

export const MySubmissions = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyAssets();
                setAssets(data);
            } catch (e: any) {
                setError(e.response?.data?.message || 'Failed to load submissions. Is the server running?');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    return (
        <DashboardLayout title="My Submissions">
            <div style={{ animation: 'fadeIn var(--transition-base)' }}>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                    Track the status of your community's archival submissions. Rejected submissions include reviewer feedback.
                </p>

                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                        Loading submissions...
                    </div>
                )}

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {!isLoading && !error && assets.length === 0 && (
                    <div className="no-data">No submissions found. Upload your first cultural asset!</div>
                )}

                <div className="audio-list">
                    {assets.map(asset => (
                        <div key={asset._id} className="audio-row framed-section" style={{ padding: '1.5rem' }}>
                            <div className="audio-info">
                                <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>{asset.title}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                    {asset.communityName} • {asset.type} •{' '}
                                    Submitted: {new Date(asset.createdAt).toLocaleDateString('en-IN')}
                                </span>

                                {/* Show rejection comment prominently */}
                                {asset.approvalStatus === 'REJECTED' && asset.reviewComment && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(239,68,68,0.06)',
                                        border: '1px solid #ef4444',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
                                        color: '#7f1d1d'
                                    }}>
                                        <strong>Reviewer Feedback:</strong> {asset.reviewComment}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                <StatusBadge status={asset.approvalStatus} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};
