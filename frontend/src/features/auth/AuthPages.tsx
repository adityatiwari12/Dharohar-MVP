import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/login', { email, password });
            const { token, user } = res.data;
            // Backend returns user.role (string) → frontend expects roles (array)
            login(token, {
                id: user.id,
                email: email,
                roles: [user.role]
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Quick-fill helpers for test credentials
    const fillCreds = (role: string) => {
        const emailMap: Record<string, string> = {
            community: 'community@dharohar.dev',
            review: 'reviewer@dharohar.dev',
            admin: 'admin@dharohar.dev',
            general: 'general@dharohar.dev',
        };
        setEmail(emailMap[role] || '');
        setPassword('Test@1234');
        setError('');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-parchment)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="framed-section" style={{ width: '100%', maxWidth: 420, padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link to="/">
                        <img src="/logo.png" alt="Dharohar Logo" style={{ maxWidth: '100px', marginBottom: '1rem' }} />
                    </Link>
                    <h2 style={{ margin: 0 }}>Sign In to DHAROHAR</h2>
                    <p style={{ color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                        Access your governance dashboard
                    </p>
                </div>

                {/* Quick-fill test buttons */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textAlign: 'center', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Quick Test Login
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {['community', 'review', 'admin', 'general'].map(role => (
                            <button
                                key={role}
                                className="minimal-btn"
                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                                onClick={() => fillCreds(role)}
                                type="button"
                            >
                                {role === 'review' ? 'Reviewer' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--color-muted-gold)',
                                borderRadius: '2px',
                                background: 'white',
                                fontSize: '0.95rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--color-muted-gold)',
                                borderRadius: '2px',
                                background: 'white',
                                fontSize: '0.95rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid #ef4444',
                            borderRadius: '4px',
                            color: '#7f1d1d',
                            fontSize: '0.85rem'
                        }}>
                            ⚠ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={isLoading}
                        style={{ marginTop: '0.5rem', padding: '0.85rem' }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const Register = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-parchment)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="framed-section" style={{ maxWidth: 420, width: '100%', padding: '2.5rem', textAlign: 'center' }}>
                <Link to="/">
                    <img src="/logo.png" alt="Dharohar Logo" style={{ maxWidth: '100px', marginBottom: '1rem' }} />
                </Link>
                <h2>Join DHAROHAR</h2>
                <p style={{ color: 'var(--color-text-light)' }}>
                    Contact your community administrator to receive access credentials.
                </p>
                <Link to="/login" style={{ marginTop: '1.5rem', display: 'inline-block' }} className="primary-btn">
                    Back to Login
                </Link>
            </div>
        </div>
    );
};
