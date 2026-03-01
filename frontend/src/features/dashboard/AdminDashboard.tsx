import { useState } from 'react';
import { mockLicenseRequests } from '../../data/mockData';
import notificationSound from '../../assets/Notification_Sound.wav';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const [licenseRequests, setLicenseRequests] = useState(mockLicenseRequests);

    const handleApprove = (id: string) => {
        // Play notification sound exclusively on approval
        const audio = new Audio(notificationSound);
        audio.play().catch(e => console.error("Audio playback failed", e));

        // Remove from pending list
        setLicenseRequests(prev => prev.filter(req => req.id !== id));
    };

    const handleReject = (id: string) => {
        setLicenseRequests(prev => prev.filter(req => req.id !== id));
    };

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header-inner">
                <h3>License Requests</h3>
                <p>Manage and govern commercial and research access to cultural archives.</p>
            </header>

            <div className="request-list">
                {licenseRequests.length === 0 ? (
                    <div className="empty-state">
                        <p>No pending license requests at this time.</p>
                    </div>
                ) : (
                    licenseRequests.map(request => (
                        <div key={request.id} className="request-card framed-section">
                            <div className="request-header">
                                <div className="applicant-info">
                                    <h4>{request.applicant}</h4>
                                    <span className="request-date">Applied: {request.requestDate}</span>
                                </div>
                                <span className={`tag status pending`}>{request.status}</span>
                            </div>

                            <div className="request-body">
                                <div className="asset-context">
                                    <strong>Requested Asset:</strong> {request.assetTitle}
                                    <span className="community-ref">({request.communityName})</span>
                                </div>

                                <div className="intended-use-badge">
                                    <strong>License Type:</strong> {request.intendedUse.replace('_', ' ')}
                                </div>

                                <div className="justification-box">
                                    <strong>Applicant Justification:</strong>
                                    <p>{request.justification}</p>
                                </div>
                            </div>

                            <div className="request-actions">
                                <button className="minimal-btn danger-text" onClick={() => handleReject(request.id)}>Deny License</button>
                                <button className="primary-btn" onClick={() => handleApprove(request.id)}>Approve License & Issue Contract</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
