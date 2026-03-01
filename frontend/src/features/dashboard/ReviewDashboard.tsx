import { useState } from 'react';
import { mockPendingAssets } from '../../data/mockData';
import { FiMapPin, FiClock, FiUser, FiMic, FiVideo } from 'react-icons/fi';
import notificationSound from '../../assets/Notification_Sound.wav';
import './ReviewDashboard.css';

export const ReviewDashboard = () => {
    const [pendingAssets, setPendingAssets] = useState(mockPendingAssets.map(a => ({
        ...a,
        location: '24.5854° N, 73.7125° E',
        timestamp: 'Mar 1, 2026, 9:20 PM',
        tribalMember: 'Arjun Warli',
        reviewerComment: ''
    })));

    const handleApprove = (id: string) => {
        const audio = new Audio(notificationSound);
        audio.play().catch(e => console.error("Audio playback failed", e));
        setPendingAssets(prev => prev.filter(asset => asset.id !== id));
    };

    const handleReject = (id: string) => {
        setPendingAssets(prev => prev.filter(asset => asset.id !== id));
    };

    return (
        <div className="review-dashboard">
            <header className="dashboard-header-inner">
                <h3>Asset Review Queue</h3>
                <p>Institutional verification of tribal metadata and cultural sensitivity.</p>
            </header>

            <div className="pending-list">
                {pendingAssets.length === 0 ? (
                    <div className="empty-state">
                        <p>No records awaiting verification.</p>
                    </div>
                ) : (
                    pendingAssets.map(asset => (
                        <div key={asset.id} className="review-card framed-section" style={{ padding: '2rem' }}>
                            <div className="review-card-header">
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span className={`tag status ${asset.riskTier.toLowerCase()}`}>{asset.riskTier} RISK</span>
                                    <span className="tag type-badge" style={{ backgroundColor: asset.type === 'BIO' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(2, 136, 209, 0.1)', color: asset.type === 'BIO' ? 'var(--color-forest)' : '#0288d1' }}>
                                        DHAROHAR-{asset.type}
                                    </span>
                                </div>
                                <div className="metadata-minimal" style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                    <FiClock /> {asset.timestamp}
                                </div>
                            </div>

                            <div className="review-card-body" style={{ marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{asset.title}</h4>
                                        <h5 className="community-name" style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>{asset.communityName}</h5>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                                        <div><FiUser /> <strong>Member:</strong> {asset.tribalMember}</div>
                                        <div><FiMapPin /> <strong>GPS:</strong> {asset.location}</div>
                                    </div>
                                </div>

                                <div className="archive-dossier" style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', border: '1px solid var(--color-muted-gold)' }}>
                                    <p className="asset-description" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"{asset.description}"</p>

                                    <div className="media-verification" style={{ display: 'flex', gap: '1rem' }}>
                                        {asset.type === 'BIO' ? (
                                            <div className="media-status-pill"><FiMic /> Voice Archive Recorded</div>
                                        ) : (
                                            <>
                                                <div className="media-status-pill"><FiMic /> Audio Track High-Fi</div>
                                                <div className="media-status-pill"><FiVideo /> Ritual Video Proof</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="reviewer-input" style={{ marginTop: '1.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Governance Comment / Internal Note</label>
                                    <textarea
                                        placeholder="Add comments regarding cultural sensitivity or data integrity..."
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px' }}
                                        value={asset.reviewerComment}
                                        onChange={e => {
                                            const newAssets = [...pendingAssets];
                                            const idx = newAssets.findIndex(a => a.id === asset.id);
                                            newAssets[idx].reviewerComment = e.target.value;
                                            setPendingAssets(newAssets);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="review-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button className="minimal-btn danger-text" onClick={() => handleReject(asset.id)}>Reject Submission</button>
                                <button className="primary-btn" onClick={() => handleApprove(asset.id)}>Approve for Archive</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
