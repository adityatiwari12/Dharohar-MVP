import React, { useState } from 'react';
import './UploadAsset.css';
import notificationSound from '../../assets/Notification_Sound.wav';

export const UploadAsset = () => {
    const [formData, setFormData] = useState({
        title: '',
        community: '',
        description: '',
        type: 'BIO',
        riskTier: 'LOW',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock API call since we don't have the backend
            // await apiClient.post('/assets', formData);
            setTimeout(() => {
                new Audio(notificationSound).play().catch(e => console.error("Audio playback failed", e));
                setSuccess(true);
                setLoading(false);
                setFormData({ title: '', community: '', description: '', type: 'BIO', riskTier: 'LOW' });
            }, 1000);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="upload-container">
            {success && (
                <div className="alert-success">
                    Your asset has been submitted and is pending review.
                    <button className="minimal-btn" onClick={() => setSuccess(false)}>Submit Another</button>
                </div>
            )}

            {!success && (
                <form className="institutional-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Asset Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Traditional Warli Painting"
                        />
                    </div>

                    <div className="form-group">
                        <label>Community Origin</label>
                        <input
                            type="text"
                            required
                            value={formData.community}
                            onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                            placeholder="e.g. Warli Tribe, Maharashtra"
                        />
                    </div>

                    <div className="form-group">
                        <label>Detailed Description</label>
                        <textarea
                            required
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide historical context and significance..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Asset Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="BIO">Biological / Botanical</option>
                                <option value="SONIC">Sonic / Musical</option>
                                <option value="VISUAL">Visual / Craft</option>
                                <option value="LITERARY">Literary / Folklore</option>
                            </select>
                        </div>

                        <div className="form-group half">
                            <label>Sensitivity Risk Tier</label>
                            <select
                                value={formData.riskTier}
                                onChange={(e) => setFormData({ ...formData, riskTier: e.target.value })}
                            >
                                <option value="LOW">Low Risk (Public Display)</option>
                                <option value="MEDIUM">Medium Risk (Registration Required)</option>
                                <option value="HIGH">High Risk (Restricted Access)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Asset for Review'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
