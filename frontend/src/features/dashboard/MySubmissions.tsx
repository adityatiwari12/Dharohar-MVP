import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { getMyAssets } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
import { FiX, FiInfo, FiFileText, FiClock } from 'react-icons/fi';

export const MySubmissions = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

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
                                <button
                                    className="minimal-btn"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    onClick={() => setSelectedAsset(asset)}
                                >
                                    View Details
                                </button>
                                <StatusBadge status={asset.approvalStatus} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Details Modal */}
                {selectedAsset && (
                    <div className="modal-overlay" style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem',
                        backdropFilter: 'blur(4px)'
                    }} onClick={() => setSelectedAsset(null)}>
                        <div className="modal-content framed-section" style={{
                            background: 'var(--color-bg-light)',
                            maxWidth: '700px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '2rem',
                            position: 'relative',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }} onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedAsset(null)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-light)'
                                }}
                            >
                                <FiX />
                            </button>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <StatusBadge status={selectedAsset.approvalStatus} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-terracotta)' }}>
                                        DHAROHAR-{selectedAsset.type}
                                    </span>
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{selectedAsset.title}</h3>
                                <p style={{ color: 'var(--color-terracotta)', fontWeight: 600, margin: '0.25rem 0' }}>{selectedAsset.communityName}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="detail-section">
                                    <h5 style={{ margin: '0 0 0.5rem', borderBottom: '1px solid var(--color-muted-gold)', paddingBottom: '0.25rem' }}>Submission Info</h5>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><FiClock style={{ marginRight: '0.4rem' }} /> {new Date(selectedAsset.createdAt).toLocaleString('en-IN')}</p>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><FiInfo style={{ marginRight: '0.4rem' }} /> Risk: {selectedAsset.riskTier || 'Standard'}</p>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><FiFileText style={{ marginRight: '0.4rem' }} /> Recordee: {selectedAsset.recordeeName}</p>
                                </div>

                                {selectedAsset.metadata && (
                                    <div className="detail-section">
                                        <h5 style={{ margin: '0 0 0.5rem', borderBottom: '1px solid var(--color-muted-gold)', paddingBottom: '0.25rem' }}>Metadata</h5>
                                        {Object.entries(selectedAsset.metadata).map(([key, value]) => (
                                            <p key={key} style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                                                <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {String(value)}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h5 style={{ margin: '0 0 0.5rem', borderBottom: '1px solid var(--color-muted-gold)', paddingBottom: '0.25rem' }}>Description</h5>
                                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic' }}>"{selectedAsset.description}"</p>
                            </div>

                            {selectedAsset.transcript && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h5 style={{ margin: '0 0 0.5rem', borderBottom: '1px solid var(--color-muted-gold)', paddingBottom: '0.25rem' }}>Oral History Transcript</h5>
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.02)',
                                        border: '1px solid var(--color-muted-gold)',
                                        fontSize: '0.9rem',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {selectedAsset.transcript}
                                    </div>
                                </div>
                            )}

                            {selectedAsset.mediaUrl && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h5 style={{ margin: '0 0 0.5rem', borderBottom: '1px solid var(--color-muted-gold)', paddingBottom: '0.25rem' }}>Media Asset</h5>
                                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-muted-gold)' }}>
                                        {selectedAsset.mediaUrl.match(/\.(mp4|webm|ogv)$/i) ? (
                                            <video controls style={{ width: '100%', maxHeight: '300px', background: '#000' }} src={selectedAsset.mediaUrl} />
                                        ) : (
                                            <audio controls style={{ width: '100%' }} src={selectedAsset.mediaUrl} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedAsset.approvalStatus === 'REJECTED' && selectedAsset.reviewComment && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1.25rem',
                                    background: 'rgba(239,68,68,0.06)',
                                    border: '1px solid #ef4444',
                                    borderRadius: '4px'
                                }}>
                                    <h5 style={{ margin: '0 0 0.5rem', color: '#7f1d1d' }}>Reviewer Feedback</h5>
                                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{selectedAsset.reviewComment}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
