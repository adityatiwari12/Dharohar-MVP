import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicAssets } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
import { SkeletonCard } from '../../components/SkeletonLoader';
import { BackButton } from '../../components/Navigation/BackButton';
import { useAuth } from '../../features/auth/AuthContext';
import './Marketplace.css';

const AttributionBlock = ({ text }: { text: string }) => {
    const parts = (text || '').split('\n');
    return (
        <div className="attribution-block">
            {parts.map((part, index) => (
                <span key={index}>{part}</span>
            ))}
            <strong>License Required for: Commercial / Research / Media Use</strong>
        </div>
    );
};

export const Marketplace = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filterType, setFilterType] = useState('ALL');
    const [filterRisk, setFilterRisk] = useState('ALL');
    const [sortBy, setSortBy] = useState('COMMUNITY');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleApply = (asset: Asset, licenseType?: string) => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/apply/${asset._id}?assetType=${asset.type}&title=${encodeURIComponent(asset.title)}&lt=${licenseType || ''}`);
    };

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await getPublicAssets();
                setAssets(data);
            } catch (e: any) {
                setError(e.response?.data?.message || 'Failed to load marketplace. Is the server running?');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const displayedAssets = assets
        .filter(a => filterType === 'ALL' || a.type === filterType)
        .filter(a => filterRisk === 'ALL' || a.riskTier === filterRisk)
        .sort((a, b) => {
            if (sortBy === 'COMMUNITY') return a.communityName.localeCompare(b.communityName);
            if (sortBy === 'RISK') {
                const riskOrder: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
                return (riskOrder[a.riskTier || 'LOW'] || 1) - (riskOrder[b.riskTier || 'LOW'] || 1);
            }
            return 0;
        });

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh', padding: '4rem 2rem' }}>
            <div className="marketplace-container">
                <BackButton />
                <header className="marketplace-header section-banner">
                    <h2>Cultural Asset Marketplace</h2>
                    <p>Structured licensing for verified indigenous knowledge and media. Only community-approved assets are listed here.</p>
                </header>

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <div className="marketplace-layout">
                    <aside className="filters-sidebar framed-section">
                        <h3>Filter Knowledge</h3>
                        <div className="filter-group">
                            <label>Asset Type</label>
                            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="ALL">All Types</option>
                                <option value="BIO">Biological Knowledge</option>
                                <option value="SONIC">Sonic / Musical</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Risk Tier</label>
                            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                                <option value="ALL">All Risk Tiers</option>
                                <option value="LOW">Low Risk</option>
                                <option value="MEDIUM">Medium Risk</option>
                                <option value="HIGH">High Risk</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Sort By</label>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="COMMUNITY">Community Name</option>
                                <option value="RISK">Risk Tier</option>
                            </select>
                        </div>
                    </aside>

                    <main className="marketplace-main">
                        <div className="marketplace-summary">
                            <span>Showing {displayedAssets.length} governed assets</span>
                        </div>

                        <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                            ) : displayedAssets.length === 0 ? (
                                <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                                    {assets.length === 0
                                        ? 'No approved assets in the marketplace yet. Assets appear here after community review approval.'
                                        : 'No assets match the current filters.'}
                                </div>
                            ) : (
                                displayedAssets.map(asset => (
                                    <div key={asset._id} className="structured-card" style={{ animation: 'fadeIn var(--transition-base)' }}>
                                        <div className="card-header">
                                            <h4 className="card-title">{asset.title}</h4>
                                            <span className="card-badge">{asset.type}</span>
                                        </div>
                                        <h5 className="card-subtitle">{asset.communityName}</h5>

                                        <div className="badges-row">
                                            {asset.riskTier && (
                                                <span className={`status tag ${asset.riskTier.toLowerCase()}`}>{asset.riskTier} RISK</span>
                                            )}
                                        </div>

                                        <p className="card-desc">{asset.description}</p>

                                        {/* ── Media Preview ── */}
                                        {asset.mediaUrl && (
                                            <div style={{ margin: '1rem 0', padding: '0.75rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-muted-gold)', borderRadius: '2px' }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-light)' }}>
                                                    {asset.type === 'SONIC' ? '🎵 Listen to Preview' : '🎙 Voice Archive'}
                                                </p>
                                                {asset.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                                    <video controls style={{ width: '100%', borderRadius: '2px', maxHeight: '180px' }} src={asset.mediaUrl} />
                                                ) : (
                                                    <audio controls style={{ width: '100%' }} src={asset.mediaUrl} />
                                                )}
                                            </div>
                                        )}

                                        <div className="marketplace-action">
                                            {asset.type === 'BIO' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                                    <button className="minimal-btn" style={{ width: '100%' }} onClick={() => handleApply(asset, 'RESEARCH')}>Apply for Research License</button>
                                                    <button className="primary-btn" style={{ width: '100%' }} onClick={() => handleApply(asset, 'COMMERCIAL')}>Apply for Commercial License</button>
                                                </div>
                                            ) : (
                                                <div style={{ width: '100%' }}>
                                                    <div className="fee-structure" style={{ marginBottom: '0.5rem' }}>
                                                        <span>Licensing Fee</span>
                                                        <strong>Tiered Governance</strong>
                                                    </div>
                                                    <button className="primary-btn" style={{ width: '100%' }} onClick={() => handleApply(asset, 'MEDIA')}>Apply for Media License</button>
                                                </div>
                                            )}
                                        </div>

                                        <AttributionBlock text={asset.recordeeName || asset.communityName} />
                                    </div>
                                ))
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
