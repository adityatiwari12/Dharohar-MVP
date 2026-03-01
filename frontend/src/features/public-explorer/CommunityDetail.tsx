import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCommunities } from '../../data/mockData';
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

export const CommunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [modalData, setModalData] = useState<any | null>(null);

    const community = mockCommunities.find(c => c.id === id);

    if (!community) {
        return (
            <div className="framed-section" style={{ margin: '10vh auto', maxWidth: 600, textAlign: 'center' }}>
                <h2>Community Archive Not Found</h2>
                <button className="minimal-btn" onClick={() => navigate('/cultural-explorer')}>Return to Explorer</button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh', paddingBottom: '6rem' }}>

            {/* Header Section */}
            <header className="community-header" style={{ backgroundImage: `linear-gradient(rgba(244, 237, 228, 0.9), rgba(244, 237, 228, 0.95)), url(${heroImage})` }}>
                <div className="header-content">
                    <h1 className="hero-title" style={{ color: 'var(--color-burnt-umber)', textShadow: 'none', fontSize: '3.5rem' }}>{community.name}</h1>
                    <div className="decorative-divider"><span className="diamond"></span></div>
                    <div className="community-meta">
                        <span>{community.region}</span>
                        <span className="dot">•</span>
                        <span>{community.culturalIdentity}</span>
                    </div>

                    {/* Attribution Line */}
                    <p className="header-attribution">Knowledge preserved and submitted by the {community.name} Council</p>
                </div>
            </header>

            <main className="explorer-container" style={{ paddingTop: '2rem' }}>

                {/* Section A - Cultural Overview */}
                <section className="dossier-section">
                    <div className="section-header">
                        <h2>Cultural Overview</h2>
                        <div className="governance-tags">
                            <span className="tag status">Governance Status: APPROVED</span>
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

                {/* Section B - Traditional Knowledge Archive */}
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

                {/* Section C - Folk Music Library */}
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
                        {community.music.length === 0 && <p className="no-data">No audio archives currently available.</p>}
                    </div>
                </section>

                {/* Section D - Cultural Media Archive */}
                <section className="dossier-section">
                    <h2>Cultural Media Archive</h2>
                    <div className="grid-layout">
                        {community.videos.map(video => (
                            <div key={video.id} className="media-card">
                                <div className="media-frame">
                                    <img src={video.thumbnail} alt={video.title} />
                                    <div className="play-overlay">▶</div>
                                </div>
                                <h4>{video.title}</h4>
                                <p className="caption">{video.description}</p>
                            </div>
                        ))}
                        {community.videos.length === 0 && <p className="no-data">No visual media currently available.</p>}
                    </div>
                </section>

            </main>

            {/* Documentation Modal */}
            {modalData && (
                <div className="modal-backdrop" onClick={() => setModalData(null)}>
                    <div className="modal-content framed-section" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setModalData(null)}>✕</button>

                        <div className="modal-header">
                            <span className="card-badge">{modalData.riskTier} RISK</span>
                            <h2>{modalData.title}</h2>
                            <h5 className="card-subtitle">{modalData.licenseType.replace('_', ' ')}</h5>
                        </div>

                        <div className="modal-body">
                            <p className="full-desc">{modalData.fullDescription}</p>

                            <div className="context-box">
                                <strong>Cultural Context</strong>
                                <p>This method has been passed down through generations and holds significant value in the community's seasonal rituals.</p>
                            </div>

                            <AttributionBlock text={modalData.attribution} />
                        </div>

                        <div className="modal-footer">
                            <button className="primary-btn" onClick={() => navigate('/marketplace')}>Apply for License</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
