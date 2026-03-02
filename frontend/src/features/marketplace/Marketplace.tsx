import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicAssets } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
import { SkeletonCard } from '../../components/SkeletonLoader';
import { BackButton } from '../../components/Navigation/BackButton';
import { useAuth } from '../../features/auth/AuthContext';
import { LicensingInfoSection } from './LicensingInfoSection';
import './Marketplace.css';

const PAGE_SIZE = 12;

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

    // ── All loaded assets (accumulated across pages) ──────────────────
    const [assets, setAssets] = useState<Asset[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Filter / sort (applied client-side on accumulated data) ───────
    const [filterType, setFilterType] = useState('ALL');
    const [filterRisk, setFilterRisk] = useState('ALL');
    const [sortBy, setSortBy] = useState('COMMUNITY');
    const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

    // ── Sentinel ref for IntersectionObserver ─────────────────────────
    const sentinelRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const handleApply = (asset: Asset, licenseType?: string) => {
        if (!user) { navigate('/login'); return; }
        navigate(`/apply/${asset._id}?assetType=${asset.type}&title=${encodeURIComponent(asset.title)}&lt=${licenseType || ''}`);
    };

    const toggleLicensingSection = (assetId: string) => {
        setExpandedAssetId(prev => (prev === assetId ? null : assetId));
    };

    // ── Fetch a single page ───────────────────────────────────────────
    const fetchPage = useCallback(async (pageNum: number) => {
        if (pageNum === 1) setIsLoading(true);
        else setIsFetchingMore(true);
        try {
            const result = await getPublicAssets(pageNum, PAGE_SIZE);
            setAssets(prev => pageNum === 1 ? result.assets : [...prev, ...result.assets]);
            setHasMore(result.hasMore);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load marketplace.');
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, []);

    // Initial load
    useEffect(() => { fetchPage(1); }, [fetchPage]);

    // ── Wire IntersectionObserver to sentinel ─────────────────────────
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
                const next = page + 1;
                setPage(next);
                fetchPage(next);
            }
        }, { rootMargin: '200px' });

        if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
        return () => observerRef.current?.disconnect();
    }, [hasMore, isFetchingMore, isLoading, page, fetchPage]);

    // ── Client-side filter + sort ─────────────────────────────────────
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
                            <select value={filterType} onChange={e => { setFilterType(e.target.value); }}>
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
                                displayedAssets.map(asset => {
                                    const isLicensingOpen = expandedAssetId === asset._id;
                                    return (
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
                                                        {asset.type === 'SONIC' ? '🎵 30s Preview' : '🎙 Voice Sample'}
                                                    </p>
                                                    {asset.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                                        <video controls style={{ width: '100%', borderRadius: '2px', maxHeight: '180px' }} src={asset.mediaUrl} />
                                                    ) : (
                                                        <audio controls style={{ width: '100%' }} src={asset.mediaUrl} />
                                                    )}
                                                </div>
                                            )}

                                            {/* ── Quick Apply Buttons ── */}
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

                                            {/* ── View Licensing Info Toggle ── */}
                                            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="lis-toggle-btn"
                                                    onClick={() => toggleLicensingSection(asset._id)}
                                                    aria-expanded={isLicensingOpen}
                                                >
                                                    {isLicensingOpen ? '▲ Hide Licensing Details' : '▼ View Licensing Options & Fees'}
                                                </button>
                                            </div>

                                            {isLicensingOpen && (
                                                <LicensingInfoSection
                                                    assetType={asset.type as 'BIO' | 'SONIC'}
                                                    onApply={(lt) => handleApply(asset, lt)}
                                                />
                                            )}

                                            <AttributionBlock text={asset.recordeeName || asset.communityName} />
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* ── Infinite scroll: loading skeleton row ── */}
                        {isFetchingMore && (
                            <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: '1.5rem' }}>
                                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
                            </div>
                        )}

                        {/* ── Sentinel: IntersectionObserver target ── */}
                        <div ref={sentinelRef} style={{ height: '1px', marginTop: '2rem' }} aria-hidden="true" />

                        {/* ── End of list message ── */}
                        {!hasMore && assets.length > 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '1.5rem', fontStyle: 'italic' }}>
                                All {assets.length} assets loaded.
                            </p>
                        )}
                    </main>
                </div>

                {/* General Licensing Guide (empty state) */}
                {!isLoading && assets.length === 0 && (
                    <div style={{ marginTop: '4rem' }}>
                        <hr style={{ borderColor: 'var(--color-muted-gold)', marginBottom: '3rem' }} />
                        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burnt-umber)', fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                            Understanding Our Licensing Framework
                        </h3>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '2.5rem' }}>
                            Browse the license types available on this platform before assets are approved.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--color-burnt-umber)', marginBottom: '1rem' }}>🌿 Biological Knowledge (BIO)</h4>
                                <LicensingInfoSection assetType="BIO" onApply={() => navigate('/login')} />
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--color-burnt-umber)', marginBottom: '1rem' }}>🎶 Sonic Heritage (SONIC)</h4>
                                <LicensingInfoSection assetType="SONIC" onApply={() => navigate('/login')} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
