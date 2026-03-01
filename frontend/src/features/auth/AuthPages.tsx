
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleDevLogin = (role: 'community' | 'review' | 'admin' | 'general') => {
        // Mock login for development purposes
        login('mock-token-123', { id: '1', email: `test@${role}.com`, roles: [role] });
        navigate('/dashboard');
    };

    return (
        <div className="framed-section" style={{ maxWidth: 400, margin: '10vh auto', textAlign: 'center' }}>
            <img src="/logo.png" alt="Dharohar Logo" style={{ maxWidth: '120px', marginBottom: '1rem' }} />
            <h2>Sign In to DHAROHAR</h2>
            <p>Log in to access your governance dashboard.</p>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="minimal-btn" onClick={() => handleDevLogin('community')}>Login as Community</button>
                <button className="minimal-btn" onClick={() => handleDevLogin('review')}>Login as Reviewer</button>
                <button className="minimal-btn" onClick={() => handleDevLogin('admin')}>Login as Admin</button>
                <button className="minimal-btn" onClick={() => handleDevLogin('general')}>Login as General</button>
            </div>
        </div>
    );
};

export const Register = () => {
    return (
        <div className="framed-section" style={{ maxWidth: 400, margin: '10vh auto', textAlign: 'center' }}>
            <img src="/logo.png" alt="Dharohar Logo" style={{ maxWidth: '120px', marginBottom: '1rem' }} />
            <h2>Join DHAROHAR</h2>
            <p>Register to contribute and review cultural assets.</p>
            <div style={{ marginTop: '2rem' }}>
                <p>Registration API is pending integration.</p>
                <a href="/login" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Login</a>
            </div>
        </div>
    );
};
