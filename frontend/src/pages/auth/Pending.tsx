import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pending: React.FC = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#1E1E24', color: '#F5F5F5', fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#2A2A35', padding: '50px', borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '100%', maxWidth: '500px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
                <h1 style={{ color: '#FF9900', fontSize: '28px', marginBottom: '16px' }}>
                    Pending Approval
                </h1>
                <p style={{ color: '#A0A0A0', lineHeight: 1.6, marginBottom: '30px' }}>
                    Your account request for <strong>MFL LABS</strong> has been received, but it requires administrator approval before you can access the platform.
                    <br /><br />
                    You will be notified once an administrator has reviewed your request.
                </p>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: '12px 24px', borderRadius: '8px', border: '1px solid #444',
                        backgroundColor: 'transparent', color: '#F5F5F5', fontSize: '14px', fontWeight: 500,
                        cursor: 'pointer', transition: 'background-color 0.2s'
                    }}
                >
                    Sign Out Return
                </button>
            </div>
        </div>
    );
};

export default Pending;
