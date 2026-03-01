import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Community } from '../../data/mockData';
import heroImage from '../../assets/beautiful.png';
import './CommunityDetail.css';

const AttributionBlock = ({ text }: { text: string }) => {
    const parts = text.split('\n');
    return (
        <div className="attribution-block">
            {parts.map((part, index) => (
                <span key={index}>{part}</span>
            ))}
            <strong>License Required for: Commercial / Research / Media Use</strong>
        </div>
    );
};

interface CommunityDossierProps {
    community: Community;
    isModal?: boolean;
    onClose?: () => void;
}

export const CommunityDossier: React.FC<CommunityDossierProps> = ({ community, isModal, onClose }) => {
    const navigate = useNavigate();
    const [modalData, setModalData] = useState<any | null>(null);

    const content = (
        <div className={`community-dossier ${isModal ? 'modal-view' : ''}`}>
            {/* Header Section */}
            <header className="community-header" style={{ backgroundImage: `linear-gradient(rgba(244, 237, 228, 0.9), rgba(244, 237, 228, 0.95)), url(${heroImage})` }}>
                <div className="header-content">
                    {isModal && <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-burnt-umber)' }}>✕</button>}
                    <h1 className="hero-title" style={{ color: 'var(--color-burnt-umber)', textShadow: 'none', fontSize: isModal ? '2.5rem' : '3.5rem' }}>{community.name}</h1>
                    <div className="decorative-divider"><span className="diamond"></span></div>
                    <div className="community-meta">
                        <span>{community.region}</span>
                        <span className="dot">•</span>
                        <span>{community.culturalIdentity}</span>
                    </div>
                    <p className="header-attribution">Knowledge preserved and submitted by the {community.name} Council</p>
                </div>
            </header>

            <main className="explorer-container" style={{ paddingTop: '2rem' }}>
                <section className="dossier-section">
                    <div className="section-header">
                        <h2>Cultural Overview</h2>
                        <div className="governance-tags">
                            <span className="tag status" style={{ animation: 'badgePop var(--transition-base)' }}>Governance Status: APPROVED</span>
                        </div>
                    </div>

                    <div className="overview-content framed-section">
                        <img src={community.image} alt={community.name} className="overview-image" />
                        <div className="overview-text">
                            <p>{community.description}</p>
                            <div className="knowledge-areas">
                                <strong>Core Knowledge Domains:</strong>
                                <ul>
                                    <li>Traditional medicinal practice</li>
                                    <li>Ritual and ceremonial structures</li>
                                    <li>Environmental & ecological knowledge</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dossier-section">
                    <h2>Traditional Knowledge Archive</h2>
                    <div className="grid-layout">
                        {community.bioKnowledge.map(bk => (
                            <div key={bk.id} className="structured-card interactive-card" onClick={() => setModalData(bk)}>
                                <div className="card-header">
                                    <h4 className="card-title">{bk.title}</h4>
                                    <span className="card-badge">{bk.riskTier} RISK</span>
                                </div>
                                <h5 className="card-subtitle">{bk.licenseType.replace('_', ' ')}</h5>
                                <p className="card-desc">{bk.summary}</p>
                                <div className="click-indicator">View Complete Documentation →</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dossier-section">
                    <h2>Folk Music Library</h2>
                    <div className="audio-list">
                        {community.music.map(track => (
                            <div key={track.id} className="audio-row framed-section">
                                <div className="audio-info">
                                    <h4>{track.title}</h4>
                                    <span className="duration">{track.duration}</span>
                                </div>
                                <div className="player-placeholder">
                                    <span>▶ Play Archive</span>
                                    <div className="progress-bar"></div>
                                </div>
                                <div className="audio-actions">
                                    <AttributionBlock text={track.attribution} />
                                    <button className="primary-btn small" onClick={() => navigate('/marketplace')}>Apply for License</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Internal Detail Modal */}
            {modalData && (
                <div className="modal-backdrop" onClick={() => setModalData(null)} style={{ zIndex: 2000 }}>
                    <div className="modal-content framed-section" onClick={e => e.stopPropagation()} style={{ animation: 'badgePop var(--transition-base)', maxWidth: '800px' }}>
                        <button className="close-btn" onClick={() => setModalData(null)}>✕</button>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--color-muted-gold)', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span className={`card-badge ${modalData.riskTier.toLowerCase()}`}>{modalData.riskTier} RISK</span>
                                <span className="tag type-badge">DHAROHAR-{modalData.type || 'BIO'}</span>
                            </div>
                            <h2 style={{ fontSize: '1.8rem' }}>{modalData.title}</h2>
                            <h5 className="card-subtitle" style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>{community.name} Archive</h5>
                        </div>

                        <div className="modal-body" style={{ marginTop: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="governance-notice-box" style={{ background: 'rgba(176, 141, 87, 0.05)', padding: '1rem', border: '1px solid var(--color-muted-gold)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                <strong>Institutional Notice:</strong> Full methodological details and high-resolution media are restricted under the <em>Cultural Governance Framework</em>.
                            </div>

                            <p className="full-desc" style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>{modalData.summary || modalData.fullDescription.substring(0, 150) + '...'}</p>

                            <div className="lock-overlay" style={{ background: '#f9f6f2', padding: '2rem', textAlign: 'center', border: '1px dashed var(--color-muted-gold)', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔒 DATA ENCRYPTED</div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                    Full {modalData.type === 'BIO' ? 'Preparation Process & Usage Context' : 'High-Fidelity Audio & Cultural Meaning'} is hidden.
                                    <br />Requires an approved Institutional License.
                                </p>
                            </div>

                            <div className="context-box">
                                <strong>Archival Metadata</strong>
                                <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                    <li><strong>Origin:</strong> {community.region}</li>
                                    <li><strong>Archive ID:</strong> {modalData.id}</li>
                                    <li><strong>Attribution:</strong> {modalData.attribution.split('\n')[0]}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-muted-gold)', paddingTop: '1.5rem' }}>
                            {modalData.type === 'BIO' ? (
                                <>
                                    <button className="minimal-btn" style={{ flex: 1 }} onClick={() => navigate('/marketplace')}>Apply for Research License</button>
                                    <button className="primary-btn" style={{ flex: 1 }} onClick={() => navigate('/marketplace')}>Apply for Commercial License</button>
                                </>
                            ) : (
                                <button className="primary-btn" style={{ width: '100%' }} onClick={() => navigate('/marketplace')}>Apply for Media License</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div className="community-modal-overlay" onClick={onClose}>
                <div className="community-modal-container" onClick={e => e.stopPropagation()}>
                    {content}
                </div>
            </div>
        );
    }

    return content;
};
