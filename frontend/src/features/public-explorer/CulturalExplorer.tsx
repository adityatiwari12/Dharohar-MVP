import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { TreeExplorer } from './TreeExplorer';
import { CommunityDossier } from './CommunityDossier';
import { mockCommunities } from '../../data/mockData';
import { getPublicAssets } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
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
    const { user } = useAuth();
    const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
    const communityGridRef = useRef<HTMLDivElement>(null);
    const [approvedAssets, setApprovedAssets] = useState<Asset[]>([]);
    const [assetsLoading, setAssetsLoading] = useState(true);

    const handleNodeClick = (id: string) => {
        if (!id.startsWith('placeholder')) {
            const element = document.getElementById(`community-card-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => setSelectedCommunityId(id), 600);
            } else if (communityGridRef.current) {
                communityGridRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Load real approved assets from the API (public endpoint, no auth needed)
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPublicAssets();
                setApprovedAssets(data);
            } catch {
                // silently fail — page still works with mock communities
            } finally {
                setAssetsLoading(false);
            }
        };
        load();
    }, []);

    const selectedCommunity = mockCommunities.find(c => c.id === selectedCommunityId);

    const bioAssets = approvedAssets.filter(a => a.type === 'BIO');
    const sonicAssets = approvedAssets.filter(a => a.type === 'SONIC');

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh' }}>

            {/* SECTION 1 - Hero */}
            <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="hero-overlay"></div>

                {/* LEFT PANE - Visualization */}
                <div className="hero-left-pane">
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

                {/* RIGHT PANE - Auth / Welcome */}
                <div className="hero-right-pane">
                    <Link to="/" style={{ display: 'block', margin: '0 auto 1.5rem', textAlign: 'center' }}>
                        <img src="/logo.png" alt="Dharohar Logo" style={{ maxWidth: '100px' }} />
                    </Link>

                    {user ? (
                        /* Logged-in welcome */
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome back</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                                Logged in as <strong>{user.roles[0]}</strong>
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button className="primary-btn" onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
                                    Go to Dashboard
                                </button>
                                <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>
                                    Browse Marketplace
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Guest login prompt */
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Institutional Access</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                                Sign in to access your governance dashboard.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button className="primary-btn" onClick={() => navigate('/login')} style={{ width: '100%' }}>
                                    Sign In
                                </button>
                                <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>
                                    Browse Marketplace
                                </button>
                            </div>
                            <div className="decorative-divider-small" style={{ margin: '2.5rem auto 1.5rem', width: '80%' }}></div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-main)' }}>
                                New to the governance platform? <br />
                                <a href="/register" style={{ fontWeight: '600', marginTop: '0.5rem', display: 'inline-block' }}>Apply for Access</a>
                            </p>
                        </div>
                    )}
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

                {/* SECTION 4 - Live Approved BIO Knowledge */}
                <section style={{ marginBottom: '6rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Knowledge Archives</h3>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Showing community-approved biological knowledge assets
                    </p>
                    {assetsLoading ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>Loading approved archives...</p>
                    ) : bioAssets.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>No approved biological assets yet. Submit assets through the community dashboard.</p>
                    ) : (
                        <div className="grid-layout">
                            {bioAssets.map(asset => (
                                <div key={asset._id} className="structured-card">
                                    <div className="card-header">
                                        <h4 className="card-title">{asset.title}</h4>
                                        <span className="card-badge">{asset.riskTier || 'LOW'} RISK</span>
                                    </div>
                                    <h5 className="card-subtitle">{asset.communityName}</h5>
                                    <p className="card-desc">{asset.description}</p>
                                    <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>
                                        Apply for License
                                    </button>
                                    <AttributionBlock text={asset.recordeeName || asset.communityName} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* SECTION 5 - Live Approved SONIC Assets */}
                <section style={{ marginBottom: '4rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Sonic Archives</h3>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Showing community-approved musical and oral heritage assets
                    </p>
                    {assetsLoading ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>Loading approved archives...</p>
                    ) : sonicAssets.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>No approved sonic assets yet.</p>
                    ) : (
                        <div className="grid-layout">
                            {sonicAssets.map(asset => (
                                <div key={asset._id} className="structured-card">
                                    <div className="card-header">
                                        <h4 className="card-title">{asset.title}</h4>
                                        <span className="card-badge">SONIC</span>
                                    </div>
                                    <h5 className="card-subtitle">{asset.communityName}</h5>
                                    <p className="card-desc">{asset.description}</p>
                                    <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: 'var(--color-bg-light)', border: '1px solid var(--color-muted-gold)', textAlign: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--color-burnt-umber)', fontWeight: '600' }}>▶ Preview available after licensing</span>
                                    </div>
                                    <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>
                                        Apply for Media License
                                    </button>
                                    <AttributionBlock text={asset.recordeeName || asset.communityName} />
                                </div>
                            ))}
                        </div>
                    )}
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
