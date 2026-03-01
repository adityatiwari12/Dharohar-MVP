import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { FiLogOut, FiHome, FiUploadCloud, FiList, FiCheckSquare, FiGlobe } from 'react-icons/fi';
import './DashboardLayout.css';

interface LayoutProps {
    title: string;
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ title, children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleLinks = () => {
        if (!user) return [];

        // We can show different links depending on user's first role
        // Or aggregate them if they have multiple roles
        const roles = user.roles;
        const links = [];

        // General user links
        links.push({ to: '/dashboard', label: 'Dashboard', icon: <FiHome /> });
        links.push({ to: '/explorer', label: 'Public Explorer', icon: <FiGlobe /> });

        if (roles.includes('community')) {
            links.push({ to: '/dashboard/assets/new', label: 'Upload Asset', icon: <FiUploadCloud /> });
            links.push({ to: '/dashboard/assets/mine', label: 'My Submissions', icon: <FiList /> });
        }

        if (roles.includes('review')) {
            links.push({ to: '/dashboard/review', label: 'Review Assets', icon: <FiCheckSquare /> });
        }

        if (roles.includes('admin')) {
            links.push({ to: '/dashboard/admin', label: 'Admin Panel', icon: <FiCheckSquare /> });
        }

        return links;
    };

    const links = getRoleLinks();

    return (
        <div className="layout-container">
            <nav className="sidebar">
                <div className="brand-section">
                    <img src="/logo.png" alt="Dharohar Logo" className="brand-logo-img" style={{ maxWidth: '100px', marginBottom: '10px' }} />
                    <h1 className="brand-logo">DHAROHAR</h1>
                    <p className="brand-subtitle">Cultural Preservation</p>
                    <div className="decorative-divider-small"></div>
                </div>

                <ul className="nav-links">
                    {links.map((link) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                end={link.to === '/dashboard'}
                                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role">{user?.roles.join(', ')}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut />
                        <span>Sign Out</span>
                    </button>
                </div>
            </nav>

            <main className="content-area">
                <header className="page-header">
                    <h2>{title}</h2>
                    <div className="decorative-divider">
                        <span className="diamond"></span>
                    </div>
                </header>

                <section className="framed-section content-framed">
                    {children}
                </section>
            </main>
        </div>
    );
};
