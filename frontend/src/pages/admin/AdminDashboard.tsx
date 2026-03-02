import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
    FiUserCheck,
    FiShield,
    FiClock,
    FiMail,
    FiLayers,
    FiCheck,
    FiX,
    FiCpu,
    FiActivity,
    FiGlobe,
    FiDatabase,
    FiLink,
    FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
    id: string;
    email: string;
    role: string;
    approved: boolean;
    created_at: string;
}

const ROLES = [
    { id: 'user', name: 'STANDARD_USER', icon: <FiLayers />, color: 'var(--primary-blue)' },
    { id: 'admin', name: 'ADMINISTRATOR', icon: <FiShield />, color: 'var(--primary-red)' },
    { id: 'manager', name: 'TEAM_MANAGER', icon: <FiGlobe />, color: '#00FF99' }
];

const AdminDashboard: React.FC = () => {
    const { user, session, isAdmin } = useAuth();
    const [pendingProfiles, setPendingProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

    useEffect(() => {
        if (session) {
            fetchProfiles();
        } else if (!loading && !session) {
            setLoading(false);
            setError('SESSION_NOT_INITIALIZED');
        }
    }, [session]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('AdminDashboard: Fetching pending profiles...');

            if (!session?.access_token) {
                console.warn('AdminDashboard: Missing access token');
                return;
            }

            const response = await axios.get('/api/v1/admin/approvals', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });

            console.log('AdminDashboard: Profiles received', response.data);
            const data = response.data as UserProfile[];
            setPendingProfiles(data);

            const initRoles: Record<string, string> = {};
            data.forEach(p => {
                initRoles[p.id] = 'user';
            });
            setSelectedRoles(initRoles);
        } catch (err: any) {
            console.error('Error fetching profiles:', err);
            const errorMsg = err.response?.data?.error || err.message || 'FAILED_TO_SYNC_WITH_SECURITY_CORE';
            const status = err.response?.status;

            if (isAdmin && (status === 401 || errorMsg.toLowerCase().includes('user not found'))) {
                setPendingProfiles([]);
                setError(null);
                return;
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (profileId: string, role: string) => {
        setSelectedRoles(prev => ({ ...prev, [profileId]: role }));
    };

    const handleApprove = async (profileId: string) => {
        try {
            setProcessing(profileId);
            const role = selectedRoles[profileId];

            await axios.post(`/api/v1/admin/approvals/${profileId}/approve`,
                { role },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );

            setPendingProfiles(prev => prev.filter(p => p.id !== profileId));
        } catch (err: any) {
            console.error('Error approving user:', err);
            alert('AUTHORIZATION_FAILURE: REQUEST_NOT_PROCESSED');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (profileId: string) => {
        if (!window.confirm('PERMANENTLY_REVOKE_REQUEST?')) return;

        try {
            setProcessing(profileId);
            await axios.post(`/api/v1/admin/approvals/${profileId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );

            setPendingProfiles(prev => prev.filter(p => p.id !== profileId));
        } catch (err: any) {
            console.error('Error rejecting request:', err);
            alert('REVOCATION_FAILURE: UNABLE_TO_TERMINATE_REQUEST');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div style={{ backgroundColor: '#050507', minHeight: '100vh', padding: '40px', color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <header style={{ borderBottom: '1px solid #222', paddingBottom: '30px', marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ color: 'var(--primary-blue)', fontSize: '10px', fontWeight: 900, letterSpacing: '4px', marginBottom: '15px' }}>
                            MFL_LABS // SECURITYCORE
                        </div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>Admin Control Panel</h1>
                    </div>
                    <div style={{ backgroundColor: '#0D0D11', padding: '12px 20px', borderRadius: '6px', border: '1px solid #222', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FiShield color="var(--primary-blue)" />
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#555' }}>OPERATOR: <span style={{ color: '#BBB' }}>{user?.email}</span></span>
                    </div>
                </header>

                {error && (
                    <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', border: '1px solid var(--primary-red)', padding: '15px 25px', borderRadius: '8px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary-red)', fontWeight: 800, fontSize: '12px', letterSpacing: '1px' }}>
                        <FiAlertCircle size={20} />
                        {error}
                        <button onClick={fetchProfiles} style={{ marginLeft: 'auto', backgroundColor: 'var(--primary-red)', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 900 }}>RETRY_SYNC</button>
                    </div>
                )}

                <div style={{ backgroundColor: '#0D0D11', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '25px 30px', borderBottom: '1px solid #222', backgroundColor: '#0A0A0E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 900, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '15px', color: '#888' }}>
                            <FiClock color="#FF9900" /> PENDING_REQUESTS
                            <span style={{ backgroundColor: '#FF9900', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>
                                {pendingProfiles.length}
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#444' }}>
                            <FiActivity className="animate-pulse" size={40} />
                            <div style={{ marginTop: '20px', fontSize: '11px', fontWeight: 900, letterSpacing: '2px' }}>RETRIEVING_DATA_STREAM...</div>
                        </div>
                    ) : pendingProfiles.length === 0 ? (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: '#444' }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}><FiUserCheck /></div>
                            <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px' }}>NO_PENDING_SECURITY_CLEARANCE_REQUIRED</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#0A0A0E', color: '#444', fontSize: '10px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '20px 30px' }}>IDENTIFIER / CREATED</th>
                                    <th style={{ padding: '20px 30px' }}><FiMail /> COMPONENT_ADDRESS</th>
                                    <th style={{ padding: '20px 30px' }}>ACCESS_LEVEL_ASSIGNMENT</th>
                                    <th style={{ padding: '20px 30px', textAlign: 'right' }}>COMMANDS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {pendingProfiles.map((profile, i) => (
                                        <motion.tr
                                            key={profile.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            style={{ borderBottom: '1px solid #1a1a20', opacity: processing === profile.id ? 0.5 : 1 }}
                                        >
                                            <td style={{ padding: '25px 30px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFF' }}>USER_{profile.id.substring(0, 8).toUpperCase()}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--primary-blue)', marginTop: '6px', fontWeight: 900, letterSpacing: '1px' }}>
                                                    DATE: {new Date(profile.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '25px 30px', color: '#666', fontSize: '13px', fontFamily: '"Fira Code", monospace' }}>{profile.email}</td>
                                            <td style={{ padding: '25px 30px' }}>
                                                <select
                                                    value={selectedRoles[profile.id] || 'user'}
                                                    onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                                    disabled={processing === profile.id}
                                                    style={{
                                                        padding: '12px 15px',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#141418',
                                                        color: '#BBB',
                                                        border: '1px solid #333',
                                                        outline: 'none',
                                                        width: '100%',
                                                        maxWidth: '250px',
                                                        fontSize: '11px',
                                                        fontWeight: 900,
                                                        letterSpacing: '1px',
                                                        cursor: processing === profile.id ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    {ROLES.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={{ padding: '25px 30px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleApprove(profile.id)}
                                                        disabled={processing !== null}
                                                        style={{ backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: processing !== null ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: '10px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', opacity: processing !== null && processing !== profile.id ? 0.3 : 1 }}
                                                    >
                                                        {processing === profile.id ? <FiActivity className="animate-spin" /> : <FiCheck />} GRANT_ACCESS
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(profile.id)}
                                                        disabled={processing !== null}
                                                        style={{ backgroundColor: 'transparent', color: '#FF3333', border: '1px solid #222', padding: '10px 15px', borderRadius: '4px', cursor: processing !== null ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: '10px', opacity: processing !== null && processing !== profile.id ? 0.3 : 1 }}
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={{ marginTop: '40px', padding: '30px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #222' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: '#555', marginBottom: '20px' }}>SYSTEM_SECURITY_LOGS</h3>
                    <div style={{ fontFamily: '"Fira Code", monospace', fontSize: '11px', color: '#444', lineHeight: 2 }}>
                        [AUTH_SEC] {new Date().toISOString()} - POLLING_PENDING_PROFILES... OK<br />
                        [AUTH_SEC] {new Date().toISOString()} - DATABASE_SYNCHRONIZED... OK<br />
                        [AUTH_SEC] {new Date().toISOString()} - SECURITY_PROTOCOL_ALPHA_ACTIVE
                    </div>
                </div>
            </div>

            <style>{`
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
