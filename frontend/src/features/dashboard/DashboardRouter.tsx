import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { useAuth } from '../auth/AuthContext';
import { UploadAsset } from '../assets/UploadAsset.tsx';
import { ReviewDashboard } from './ReviewDashboard';
import { AdminDashboard } from './AdminDashboard';
import { MySubmissions } from './MySubmissions';
import { MyLicenses } from './MyLicenses';

const AnimatedCounter = ({ value, label }: { value: number, label: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const duration = 1000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="stat-card" style={{
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid var(--color-muted-gold)',
            borderRadius: 'var(--border-radius)',
            background: 'var(--color-bg-light)',
            flex: '1',
            minWidth: '200px',
            animation: 'fadeInUp var(--transition-base)'
        }}>
            <h4 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--color-terracotta)' }}>{count}</h4>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
        </div>
    );
};

const Overview = () => {
    const { user } = useAuth();

    // Redirect governance users to their primary view
    if (user?.roles.includes('community')) {
        return <Navigate to="/dashboard/assets/mine" replace />;
    }
    if (user?.roles.includes('general')) {
        return <Navigate to="/dashboard/licenses/mine" replace />;
    }
    if (user?.roles.includes('review')) {
        return <Navigate to="/dashboard/review-queue" replace />;
    }
    if (user?.roles.includes('admin')) {
        return <Navigate to="/dashboard/license-requests" replace />;
    }

    return (
        <div style={{ animation: 'fadeIn var(--transition-slow)' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h3>Institutional Overview</h3>
                <p style={{ color: 'var(--color-text-light)' }}>Live governance metrics for the DHAROHAR ecosystem.</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
                <AnimatedCounter value={124} label="Total Submissions" />
                <AnimatedCounter value={12} label="Pending Reviews" />
                <AnimatedCounter value={89} label="Approved Licenses" />
            </div>

            <div className="framed-section" style={{ padding: '2rem' }}>
                <h4>Governance Notice</h4>
                <p>Welcome back, <strong>{user?.roles[0]}</strong>. Your account is verified for the DHAROHAR governance framework. Please use the sidebar to access role-specific actions.</p>
            </div>
        </div>
    );
};

export const DashboardRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<DashboardLayout title="Overview"><Overview /></DashboardLayout>} />
            <Route path="/assets/new" element={<DashboardLayout title="Upload Asset"><UploadAsset /></DashboardLayout>} />
            <Route path="/assets/mine" element={<MySubmissions />} />
            <Route path="/review-queue" element={<DashboardLayout title="Review Queue"><ReviewDashboard /></DashboardLayout>} />
            <Route path="/license-requests" element={<DashboardLayout title="License Requests"><AdminDashboard /></DashboardLayout>} />
            <Route path="/licenses/mine" element={<MyLicenses />} />
        </Routes>
    );
};
