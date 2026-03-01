import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
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
    FiTerminal,
    FiCheckCircle,
    FiDatabase,
    FiLink
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingUser {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    metadata?: any;
}

const WORKSPACES = [
    { id: 'designer', name: 'GRAPHIC_DESIGNER', icon: <FiLayers />, color: 'var(--primary-red)' },
    { id: 'analyst', name: 'SYSTEM_ANALYST', icon: <FiDatabase />, color: 'var(--primary-blue)' },
    { id: 'qa', name: 'TEST_ENGINEER', icon: <FiShield />, color: '#00FF99' },
    { id: 'ai-builder', name: 'AI_BUILDER', icon: <FiCpu />, color: 'var(--primary-red)' },
    { id: 'integration', name: 'CI/CD_PIPELINE', icon: <FiLink />, color: '#9900FF' },
    { id: 'client', name: 'CLIENT_PORTAL', icon: <FiGlobe />, color: '#BBB' }
];

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkspaces, setSelectedWorkspaces] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, full_name, created_at, metadata')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPendingUsers(data || []);

            const initSelected: Record<string, string> = {};
            data?.forEach(u => {
                const preference = (u as any).metadata?.requested_role;
                initSelected[u.id] = preference || 'designer';
            });
            setSelectedWorkspaces(initSelected);
        } catch (error) {
            console.error('Error fetching pending users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWorkspaceChange = (userId: string, workspaceId: string) => {
        setSelectedWorkspaces(prev => ({ ...prev, [userId]: workspaceId }));
    };

    const handleApprove = async (userId: string) => {
        try {
            const assignedWorkspace = selectedWorkspaces[userId];
            const compositeStatus = `active:${assignedWorkspace}`;

            const { error } = await supabase
                .from('users')
                .update({ status: compositeStatus })
                .eq('id', userId);

            if (error) throw error;
            setPendingUsers(pendingUsers.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const handleReject = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ status: 'rejected' })
                .eq('id', userId);

            if (error) throw error;
            setPendingUsers(pendingUsers.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Error rejecting user:', error);
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

                <div style={{ backgroundColor: '#0D0D11', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '25px 30px', borderBottom: '1px solid #222', backgroundColor: '#0A0A0E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 900, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '15px', color: '#888' }}>
                            <FiClock color="#FF9900" /> PENDING_REQUESTS
                            <span style={{ backgroundColor: '#FF9900', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>
                                {pendingUsers.length}
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#444' }}>
                            <FiActivity className="animate-pulse" size={40} />
                            <div style={{ marginTop: '20px', fontSize: '11px', fontWeight: 900, letterSpacing: '2px' }}>RETRIEVING_DATA_STREAM...</div>
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: '#444' }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}><FiUserCheck /></div>
                            <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px' }}>NO_PENDING_SECURITY_CLEARANCE_REQUIRED</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#0A0A0E', color: '#444', fontSize: '10px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '20px 30px' }}>IDENTIFIER / ROLE_PREF</th>
                                    <th style={{ padding: '20px 30px' }}><FiMail /> COMPONENT_ADDRESS</th>
                                    <th style={{ padding: '20px 30px' }}>ACCESS_LEVEL_ASSIGNMENT</th>
                                    <th style={{ padding: '20px 30px', textAlign: 'right' }}>COMMANDS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {pendingUsers.map((u, i) => (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            style={{ borderBottom: '1px solid #1a1a20' }}
                                        >
                                            <td style={{ padding: '25px 30px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFF' }}>{u.full_name.toUpperCase()}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--primary-blue)', marginTop: '6px', fontWeight: 900, letterSpacing: '1px' }}>
                                                    REQ_ROLE: {u.metadata?.requested_role?.toUpperCase() || 'GENERAL_ACCESS'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '25px 30px', color: '#666', fontSize: '13px', fontFamily: '"Fira Code", monospace' }}>{u.email}</td>
                                            <td style={{ padding: '25px 30px' }}>
                                                <select
                                                    value={selectedWorkspaces[u.id] || 'designer'}
                                                    onChange={(e) => handleWorkspaceChange(u.id, e.target.value)}
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
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {WORKSPACES.map(ws => (
                                                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={{ padding: '25px 30px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleApprove(u.id)}
                                                        style={{ backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 900, fontSize: '10px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <FiCheck /> GRANT_ACCESS
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(u.id)}
                                                        style={{ backgroundColor: 'transparent', color: '#FF3333', border: '1px solid #222', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 900, fontSize: '10px' }}
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
                        [AUTH_SEC] {new Date().toISOString()} - POLLING_PENDING_USERS... OK<br />
                        [AUTH_SEC] {new Date().toISOString()} - DATABASE_SYNCHRONIZED... OK<br />
                        [AUTH_SEC] {new Date().toISOString()} - SECURITY_PROTOCOL_ALPHA_ACTIVE
                    </div>
                </div>
            </div>

            <style>{`
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
