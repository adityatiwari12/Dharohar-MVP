import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TreeExplorer } from './TreeExplorer';
import { mockCommunities, allMarketplaceAssets } from '../../data/mockData';
import heroImage from '../../assets/beautiful.png';
import ceremonialSymbol from '../../assets/image copy 2.png';
import './CulturalExplorer.css';

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

export const CulturalExplorer = () => {
    const navigate = useNavigate();

    // Grab some samples for the showcase sections
    const featuredKnowledge = allMarketplaceAssets.filter(a => a.type === 'BIO').slice(0, 3);
    const folkMusic = allMarketplaceAssets.filter(a => a.type === 'SONIC').slice(0, 3);

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh' }}>

            {/* SECTION 1 - Hero */}
            <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="hero-overlay"></div>

                {/* 3D Explorer is positioned absolutely or fixed within hero if full screen, 
                    or just rendered inside the hero content */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
                    <TreeExplorer />
                </div>

                <div className="hero-content">
                    <img src="/logo.png" alt="Dharohar Logo" className="hero-logo-img" style={{ maxWidth: '150px', marginBottom: '1rem', zIndex: 10, position: 'relative' }} />
                    <img src={ceremonialSymbol} alt="Ceremonial Rotation" className="ceremonial-symbol" />
                    <h1 className="hero-title">DHAROHAR</h1>
                </div>
            </section>

            <main className="explorer-container">

                {/* SECTION 2 - Introduction Banner */}
                <section className="section-banner">
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Preserving and Licensing Indigenous Knowledge through Structured Governance</h2>
                    <div className="decorative-divider"><span className="diamond"></span></div>
                </section>

                {/* SECTION 3 - Featured Communities Grid */}
                <section style={{ marginBottom: '6rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Featured Communities</h3>
                    <div className="grid-layout">
                        {mockCommunities.map(community => (
                            <div key={community.id} className="structured-card">
                                <div className="card-header">
                                    <h4 className="card-title">{community.name}</h4>
                                </div>
                                <h5 className="card-subtitle">{community.region}</h5>

                                {community.image && (
                                    <div style={{ width: '100%', height: '160px', overflow: 'hidden', borderRadius: '2px', marginBottom: '1rem' }}>
                                        <img src={community.image} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}

                                <p className="card-desc">{community.culturalIdentity}</p>

                                <button className="minimal-btn" style={{ width: '100%' }} onClick={() => navigate(`/community/${community.id}`)}>
                                    Explore Community
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 4 - Knowledge Archive Highlights */}
                <section style={{ marginBottom: '6rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Knowledge Archives</h3>
                    <div className="grid-layout">
                        {featuredKnowledge.map(asset => (
                            <div key={asset.id} className="structured-card">
                                <div className="card-header">
                                    <h4 className="card-title">{asset.title}</h4>
                                    <span className="card-badge">{asset.riskTier} RISK</span>
                                </div>
                                <h5 className="card-subtitle">{asset.communityName} • {asset.licenseType.replace('_', ' ')}</h5>
                                <p className="card-desc">{asset.summary}</p>

                                <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>View Details</button>

                                <AttributionBlock text={asset.attribution} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 5 - Folk Music Showcase */}
                <section style={{ marginBottom: '4rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Folk Music Showcase</h3>
                    <div className="grid-layout">
                        {folkMusic.map(track => (
                            <div key={track.id} className="structured-card">
                                <div className="card-header">
                                    <h4 className="card-title">{track.title}</h4>
                                    <span className="card-badge">{track.licenseType.replace('_', ' ')}</span>
                                </div>
                                <h5 className="card-subtitle">{track.communityName} • Duration: {track.duration}</h5>

                                <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: 'var(--color-bg-light)', border: '1px solid var(--color-muted-gold)', textAlign: 'center' }}>
                                    {/* Placeholder HTML5 Audio */}
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-burnt-umber)', fontWeight: '600' }}>▶ Play Preview</span>
                                </div>

                                <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>Apply for License</button>

                                <AttributionBlock text={track.attribution} />
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};
