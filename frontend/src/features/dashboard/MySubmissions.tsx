import { DashboardLayout } from '../../components/Layout/DashboardLayout';

export const MySubmissions = () => {
    // For demonstration, we'll just show the Warli tribe's first bio knowledge as "ours"
    const mySubmissions = [
        {
            id: 'sub-1',
            title: 'Digestive Herbal Infusion',
            type: 'BIO',
            submittedDate: '2023-11-05',
            status: 'APPROVED',
            community: 'Warli Tribe'
        }
    ];

    return (
        <DashboardLayout title="My Submissions">
            <div style={{ animation: 'fadeIn var(--transition-base)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--color-text-light)' }}>View and track the status of your community's archival submissions.</p>
                </div>

                <div className="audio-list">
                    {mySubmissions.map(sub => (
                        <div key={sub.id} className="audio-row framed-section" style={{ padding: '1.5rem' }}>
                            <div className="audio-info">
                                <h4 style={{ margin: 0 }}>{sub.title}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                    Submitted: {sub.submittedDate} • {sub.community}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className={`tag status ${sub.status.toLowerCase()}`} style={{
                                    backgroundColor: sub.status === 'APPROVED' ? 'rgba(56, 142, 60, 0.1)' : 'rgba(176, 141, 87, 0.1)',
                                    color: sub.status === 'APPROVED' ? 'var(--color-success)' : 'var(--color-terracotta)',
                                    border: `1px solid ${sub.status === 'APPROVED' ? 'var(--color-success)' : 'var(--color-terracotta)'}`,
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '2px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}>
                                    {sub.status}
                                </span>
                                <button className="minimal-btn" style={{ padding: '0.4rem 0.8rem' }}>View Details</button>
                            </div>
                        </div>
                    ))}
                </div>

                {mySubmissions.length === 0 && (
                    <div className="no-data">
                        No submissions found for your community account.
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
