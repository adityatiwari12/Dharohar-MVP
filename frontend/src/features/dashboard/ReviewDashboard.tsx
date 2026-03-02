import { useState, useEffect } from 'react';
import { FiMic } from 'react-icons/fi';
import { StatusBadge } from '../../components/StatusBadge';
import { getPendingAssets, approveAsset, rejectAsset } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
import { RoleMediaPlayer } from '../../components/RoleMediaPlayer';
import { Loader } from '../../components/Loader/Loader';
import notificationSound from '../../assets/Notification_Sound.wav';
import './ReviewDashboard.css';

export const ReviewDashboard = () => {
    const [pendingAssets, setPendingAssets] = useState<Asset[]>([]);
    const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<Record<string, string>>({});

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPendingAssets();
                setPendingAssets(data);
            } catch (e: any) {
                setError(e.response?.data?.message || 'Failed to load review queue. Is the server running?');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleApprove = async (id: string) => {
        setIsActioning(true);
        try {
            await approveAsset(id);
            // Play sound on approval only
            const audio = new Audio(notificationSound);
            audio.play().catch(e => console.error('Audio playback failed', e));
            // Remove from queue
            setPendingAssets(prev => prev.filter(a => a._id !== id));
            setActionError(prev => ({ ...prev, [id]: '' }));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || 'Approve failed' }));
        } finally {
            setIsActioning(false);
        }
    };

    const handleReject = async (id: string) => {
        const comment = reviewComments[id] || '';
        if (!comment.trim()) {
            setActionError(prev => ({ ...prev, [id]: 'A review comment is required to reject a submission.' }));
            return;
        }
        setIsActioning(true);
        try {
            await rejectAsset(id, comment);
            setPendingAssets(prev => prev.filter(a => a._id !== id));
            setActionError(prev => ({ ...prev, [id]: '' }));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || 'Reject failed' }));
        } finally {
            setIsActioning(false);
        }
    };

    return (
        <div className="review-dashboard">
            {isActioning && <Loader label="Processing decision..." />}
            <header className="dashboard-header-inner">
                <h3>Asset Review Queue</h3>
                <p>Institutional verification of tribal metadata and cultural integrity. All decisions are final and server-enforced.</p>
            </header>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                    Loading review queue...
                </div>
            )}

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className="pending-list">
                {!isLoading && !error && pendingAssets.length === 0 && (
                    <div className="empty-state">
                        <StatusBadge status="APPROVED" />
                        <p>No records awaiting verification. The queue is clear.</p>
                    </div>
                )}

                {pendingAssets.map(asset => (
                    <div key={asset._id} className="review-card framed-section" style={{ padding: '2rem' }}>
                        <div className="review-card-header">
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <StatusBadge status={asset.approvalStatus} />
                                <span className={`tag type-badge`} style={{
                                    background: asset.type === 'BIO' ? 'rgba(46,125,50,0.1)' : 'rgba(2,136,209,0.1)',
                                    color: asset.type === 'BIO' ? 'var(--color-forest)' : '#0288d1',
                                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700
                                }}>
                                    DHAROHAR-{asset.type}
                                </span>
                                {asset.riskTier && (
                                    <span className={`tag status ${asset.riskTier?.toLowerCase()}`}>{asset.riskTier} RISK</span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                {new Date(asset.createdAt).toLocaleString('en-IN')}
                            </div>
                        </div>

                        <div className="review-card-body" style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{asset.title}</h4>
                            <h5 style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>{asset.communityName}</h5>

                            {asset.createdBy && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                                    Submitted by: <strong>{(asset.createdBy as any).name}</strong> ({(asset.createdBy as any).email})
                                </p>
                            )}

                            <div className="archive-dossier" style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', border: '1px solid var(--color-muted-gold)' }}>
                                <p className="asset-description" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"{asset.description}"</p>

                                {/* Full media player for reviewer — no restrictions */}
                                {asset.mediaUrl ? (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <RoleMediaPlayer
                                            src={asset.mediaUrl}
                                            mode="full"
                                            label={asset.type === 'SONIC' ? '🎵 Sonic Archive — Listen before reviewing:' : '🎙 Voice Archive — Listen before reviewing:'}
                                        />
                                    </div>
                                ) : (
                                    <div className="media-verification" style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="media-status-pill" style={{ opacity: 0.5 }}>
                                            <FiMic /> No media file uploaded
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="reviewer-input" style={{ marginTop: '1.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                    Review Comment <span style={{ color: '#ef4444' }}>*Required for Rejection</span>
                                </label>
                                <textarea
                                    placeholder="Add comments regarding cultural sensitivity, metadata accuracy, or rejection reason..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', minHeight: '80px' }}
                                    value={reviewComments[asset._id] || ''}
                                    onChange={e => setReviewComments(prev => ({ ...prev, [asset._id]: e.target.value }))}
                                />
                            </div>

                            {actionError[asset._id] && (
                                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                    ⚠ {actionError[asset._id]}
                                </p>
                            )}
                        </div>

                        <div className="review-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="minimal-btn danger-text"
                                onClick={() => handleReject(asset._id)}
                            >
                                Reject Submission
                            </button>
                            <button
                                className="primary-btn"
                                onClick={() => handleApprove(asset._id)}
                            >
                                Approve for Archive
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
