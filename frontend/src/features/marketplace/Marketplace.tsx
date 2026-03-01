import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { allMarketplaceAssets } from '../../data/mockData';
import { SkeletonCard } from '../../components/SkeletonLoader';
import { BackButton } from '../../components/Navigation/BackButton';
import './Marketplace.css';

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

export const Marketplace = () => {
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState('ALL');
    const [filterRisk, setFilterRisk] = useState('ALL');
    const [sortBy, setSortBy] = useState('COMMUNITY');
    const [isLoading, setIsLoading] = useState(true);

    // Simulate network delay and filter re-calculation
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [filterType, filterRisk, sortBy]);

    // Basic filtering and sorting logic
    const displayedAssets = allMarketplaceAssets
        .filter(asset => filterType === 'ALL' || asset.type === filterType)
        .filter(asset => filterRisk === 'ALL' || asset.riskTier === filterRisk)
        .sort((a, b) => {
            if (sortBy === 'COMMUNITY') return a.communityName.localeCompare(b.communityName);
            if (sortBy === 'LICENSE') return a.licenseType.localeCompare(b.licenseType);
            if (sortBy === 'RISK') {
                const riskOrder: any = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
                return riskOrder[a.riskTier] - riskOrder[b.riskTier];
            }
            return 0;
        });

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh', padding: '4rem 2rem' }}>
            <div className="marketplace-container">
                <BackButton />
                {/* Header */}
                <header className="marketplace-header section-banner">
                    <h2>Cultural Asset Marketplace</h2>
                    <p>Structured licensing for verified indigenous knowledge and media.</p>
                </header>

                <div className="marketplace-layout">

                    {/* Left Sidebar Filters */}
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
                                <option value="LICENSE">License Type</option>
                                <option value="RISK">Risk Tier</option>
                            </select>
                        </div>
                    </aside>

                    {/* Main Grid */}
                    <main className="marketplace-main">
                        <div className="marketplace-summary">
                            <span>Showing {displayedAssets.length} governed assets</span>
                        </div>

                        <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))
                            ) : displayedAssets.length === 0 ? (
                                <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                                    No assets match the current governance filters.
                                </div>
                            ) : (
                                displayedAssets.map(asset => (
                                    <div key={asset.id} className="structured-card" style={{ animation: 'fadeIn var(--transition-base)' }}>
                                        <div className="card-header">
                                            <h4 className="card-title">{asset.title}</h4>
                                            <span className="card-badge">{asset.type}</span>
                                        </div>
                                        <h5 className="card-subtitle">{asset.communityName}</h5>

                                        <div className="badges-row">
                                            <span className={`status tag ${(asset.riskTier || 'LOW').toLowerCase()}`}>{asset.riskTier || 'LOW'} RISK</span>
                                            <span className="tag license">{(asset.licenseType || 'COMMUNITY_CONSENT').replace('_', ' ')}</span>
                                        </div>

                                        {asset.type === 'SONIC' && (
                                            <div className="audio-preview">
                                                <span>▶ Play Preview</span>
                                            </div>
                                        )}
                                        {asset.type === 'BIO' && (
                                            <p className="card-desc truncate">{asset.summary || 'No summary available.'}</p>
                                        )}

                                        <div className="marketplace-action">
                                            {asset.type === 'BIO' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                                    <button className="minimal-btn" style={{ width: '100%' }} onClick={() => navigate('/login')}>Apply for Research License</button>
                                                    <button className="primary-btn" style={{ width: '100%' }} onClick={() => navigate('/login')}>Apply for Commercial License</button>
                                                </div>
                                            ) : (
                                                <div style={{ width: '100%' }}>
                                                    <div className="fee-structure" style={{ marginBottom: '0.5rem' }}>
                                                        <span>Licensing Fee</span>
                                                        <strong>Tiered Governance</strong>
                                                    </div>
                                                    <button
                                                        className="primary-btn"
                                                        style={{ width: '100%' }}
                                                        onClick={() => navigate('/login')}
                                                    >
                                                        Apply for Media License
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <AttributionBlock text={asset.attribution} />
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
