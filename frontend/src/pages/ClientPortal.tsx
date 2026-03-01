import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ClientPortal: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div style={{ backgroundColor: '#1E1E24', minHeight: '100vh', padding: '40px', color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: '#00CED1', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>MFL LABS Client Portal</h1>
                        <p style={{ color: '#A0A0A0', margin: '5px 0 0 0' }}>Project Progress & Reporting</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ color: '#A0A0A0', fontSize: '14px' }}>Logged in as: {user?.email}</span>
                        <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#FF3333', border: '1px solid #FF3333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                            Sign Out
                        </button>
                    </div>
                </header>

                <div style={{
                    backgroundColor: 'rgba(42, 42, 53, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '40px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
                    <h2 style={{ color: '#F5F5F5', fontSize: '28px', marginBottom: '20px' }}>Project Overview</h2>
                    <p style={{ color: '#A0A0A0', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
                        Welcome to the MFL LABS Client Portal. This read-only interface provides real-time visibility into the assembly matrix.
                        Live reporting and build artifacts from the unified application will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClientPortal;
