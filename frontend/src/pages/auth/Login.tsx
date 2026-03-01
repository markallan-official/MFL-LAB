import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-redirect if already logged in
    React.useEffect(() => {
        if (user && !authLoading) {
            const destination = location.state?.from?.pathname || '/';
            navigate(destination, { replace: true });
        }
    }, [user, authLoading, navigate, location.state]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // The context will update soon, but we can do a quick check
            // or just go to / which will then redirect inside Dashboard.tsx
            navigate('/');
        } catch (error: any) {
            setError(error.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#1E1E24', color: '#F5F5F5', fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#2A2A35', padding: '40px', borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px'
            }}>
                <h1 style={{ color: '#0066FF', fontSize: '28px', textAlign: 'center', marginBottom: '8px', letterSpacing: '1px' }}>
                    MFL LABS
                </h1>
                <p style={{ color: '#A0A0A0', textAlign: 'center', marginBottom: '32px' }}>
                    Sign in to your workspace
                </p>

                {error && <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', color: '#FF3333', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#A0A0A0' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444',
                                backgroundColor: '#1E1E24', color: '#F5F5F5', fontSize: '16px', outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#A0A0A0' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444',
                                backgroundColor: '#1E1E24', color: '#F5F5F5', fontSize: '16px', outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '10px', padding: '14px', borderRadius: '8px', border: 'none',
                            backgroundColor: '#0066FF', color: 'white', fontSize: '16px', fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '30px', color: '#A0A0A0', fontSize: '14px' }}>
                    Don't have an account? <Link to="/request-access" style={{ color: '#0066FF', textDecoration: 'none', fontWeight: 500 }}>Request Access</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
