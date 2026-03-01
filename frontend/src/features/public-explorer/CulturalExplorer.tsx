
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { TreeExplorer } from './TreeExplorer';
import { CommunityDossier } from './CommunityDossier';
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
    const { login } = useAuth();
    const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
    const communityGridRef = useRef<HTMLDivElement>(null);

    const handleNodeClick = (id: string) => {
        // If it's a real community, scroll to the grid and open modal
        if (!id.startsWith('placeholder')) {
            const element = document.getElementById(`community-card-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Deliberately delay modal to let scroll happen
                setTimeout(() => setSelectedCommunityId(id), 600);
            } else if (communityGridRef.current) {
                communityGridRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const selectedCommunity = mockCommunities.find(c => c.id === selectedCommunityId);

    const handleDevLogin = (role: 'community' | 'review' | 'admin' | 'general') => {
        // Mock login for development purposes
        login('mock-token-123', { id: '1', email: `test@${role}.com`, roles: [role] });
        navigate('/dashboard');
    };

    // Grab some samples for the showcase sections
    const featuredKnowledge = allMarketplaceAssets.filter(a => a.type === 'BIO').slice(0, 3);
    const folkMusic = allMarketplaceAssets.filter(a => a.type === 'SONIC').slice(0, 3);

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh' }}>

            {/* SECTION 1 - Hero */}
            <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="hero-overlay"></div>

                {/* LEFT PANE - Visualization */}
                <div className="hero-left-pane">
                    {/* 3D Explorer is positioned absolutely within the left pane to not disrupt flow */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
                        <TreeExplorer onNodeClick={handleNodeClick} />
                    </div>

                    <div className="hero-content" style={{ zIndex: 3 }}>
                        <img src={ceremonialSymbol} alt="Ceremonial Rotation" className="ceremonial-symbol" />
                        <h1 className="hero-title">DHAROHAR</h1>
                        <p style={{ color: 'var(--color-parchment)', fontSize: '1.2rem', marginTop: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>
                            Cultural Knowledge & Licensing
                        </p>
                    </div>
                </div>

                {/* RIGHT PANE - Login Area */}
                <div className="hero-right-pane">
                    <img src="/logo.png" alt="Dharohar Logo" style={{ maxWidth: '100px', marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>Institutional Access</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '2rem', textAlign: 'center' }}>
                        Select your governance role to sign in.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="minimal-btn" onClick={() => handleDevLogin('general')} style={{ width: '100%', textAlign: 'center' }}>
                            Login as General User
                        </button>
                        <button className="minimal-btn" onClick={() => handleDevLogin('community')} style={{ width: '100%', textAlign: 'center' }}>
                            Login as Community
                        </button>
                        <button className="minimal-btn" onClick={() => handleDevLogin('review')} style={{ width: '100%', textAlign: 'center' }}>
                            Login as Reviewer
                        </button>
                        <button className="minimal-btn" onClick={() => handleDevLogin('admin')} style={{ width: '100%', border: '1px solid var(--color-burnt-umber)', color: 'var(--color-burnt-umber)', textAlign: 'center' }}>
                            Login as Administrator
                        </button>
                    </div>

                    <div className="decorative-divider-small" style={{ margin: '2.5rem auto 1.5rem', width: '80%' }}></div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', textAlign: 'center' }}>
                        New to the governance platform? <br />
                        <a href="/register" style={{ fontWeight: '600', marginTop: '0.5rem', display: 'inline-block' }}>Apply for Access</a>
                    </p>
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
                    <div className="grid-layout" ref={communityGridRef}>
                        {mockCommunities.map(community => (
                            <div
                                key={community.id}
                                id={`community-card-${community.id}`}
                                className="structured-card interactive-card"
                                onClick={() => setSelectedCommunityId(community.id)}
                            >
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

                                <button
                                    className="minimal-btn"
                                    style={{ width: '100%' }}
                                    onClick={(e) => { e.stopPropagation(); navigate(`/community/${community.id}`); }}
                                >
                                    View Full Dossier
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

                {/* SECTION 4 - Knowledge Archive Highlights ... (remains same) */}

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
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-burnt-umber)', fontWeight: '600' }}>▶ Play Preview</span>
                                </div>

                                <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>Apply for License</button>

                                <AttributionBlock text={track.attribution} />
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* Community Modal */}
            {selectedCommunity && (
                <CommunityDossier
                    community={selectedCommunity}
                    isModal={true}
                    onClose={() => setSelectedCommunityId(null)}
                />
            )}
        </div>
    );
};
