
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { useAuth } from '../auth/AuthContext';
import { UploadAsset } from '../assets/UploadAsset';


const Overview = () => {
    const { user } = useAuth();

    // Redirect general users to the Cultural Explorer
    if (user?.roles.includes('general')) {
        return <Navigate to="/cultural-explorer" replace />;
    }

    return (
        <div>
            <h3>Welcome back, role: {user?.roles[0]}</h3>
            <p style={{ marginTop: '1rem' }}>Select an option from the sidebar to manage cultural assets.</p>
        </div>
    );
};

export const DashboardRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<DashboardLayout title="Overview"><Overview /></DashboardLayout>} />
            <Route path="/assets/new" element={<DashboardLayout title="Upload Asset"><UploadAsset /></DashboardLayout>} />
            {/* Additional dashboard routes will go here as they are built */}
        </Routes>
    );
};
