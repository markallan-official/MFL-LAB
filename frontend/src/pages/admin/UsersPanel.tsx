import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
    FiUsers,
    FiShield,
    FiMail,
    FiCheck,
    FiX,
    FiActivity,
    FiAlertCircle,
    FiSearch,
    FiFilter,
    FiEdit2,
    FiTrash2,
    FiUser
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import HealthBadge from '../../components/HealthBadge';

interface UserProfile {
    id: string;
    email: string;
    role: string;
    approved: boolean;
    created_at: string;
    full_name?: string;
}

const ROLES = [
    { id: 'user', name: 'STANDARD_USER', color: '#0066FF' },
    { id: 'admin', name: 'ADMINISTRATOR', color: '#FF3333' },
    { id: 'manager', name: 'TEAM_MANAGER', color: '#00FF99' },
    { id: 'designer', name: 'DESIGNER', color: '#FF9900' },
    { id: 'analyst', name: 'ANALYST', color: '#9933FF' },
    { id: 'qa', name: 'QA_TESTER', color: '#FF33CC' },
    { id: 'ai-builder', name: 'AI_BUILDER', color: '#00FFFF' },
    { id: 'integration', name: 'INTEGRATION', color: '#FFFF00' }
];

const UsersPanel: React.FC = () => {
    const { user, session } = useAuth();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

    useEffect(() => {
        fetchProfiles();
    }, [session]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!session?.access_token) return;

            const response = await axios.get('/api/v1/admin/users', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });

            setProfiles(response.data);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.error || err.message || 'FAILED_TO_SYNC_USERS');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (profileId: string) => {
        try {
            setProcessing(profileId);
            const profile = profiles.find(p => p.id === profileId);
            const role = profile?.role || 'user';

            await axios.post(`/api/v1/admin/users/${profileId}/approve`,
                { role },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );

            setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, approved: true } : p));
        } catch (err: any) {
            alert('APPROVAL_FAILURE');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (profileId: string) => {
        if (!window.confirm('REMOVE_USER_PERMANENTLY?')) return;
        try {
            setProcessing(profileId);
            await axios.post(`/api/v1/admin/users/${profileId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            setProfiles(prev => prev.filter(p => p.id !== profileId));
        } catch (err: any) {
            alert('REJECTION_FAILURE');
        } finally {
            setProcessing(null);
        }
    };

    const handleRoleChange = async (profileId: string, role: string) => {
        try {
            setProcessing(profileId);
            await axios.put(`/api/v1/admin/users/${profileId}/role`,
                { role },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role } : p));
        } catch (err: any) {
            alert('ROLE_UPDATE_FAILURE');
        } finally {
            setProcessing(null);
        }
    };

    const filteredProfiles = profiles.filter(p => {
        const matchesSearch = p.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'all' || 
                             (filterStatus === 'pending' && !p.approved) || 
                             (filterStatus === 'approved' && p.approved);
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ backgroundColor: '#050507', minHeight: '100vh', padding: '40px', color: '#F5F5F5' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ borderBottom: '1px solid #222', paddingBottom: '30px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ color: '#0066FF', fontSize: '10px', fontWeight: 900, letterSpacing: '4px', marginBottom: '15px' }}>
                            MFL_LABS // IDENTITY_MANAGER
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0 }}>Users Panel</h1>
                    </div>
                    <HealthBadge compact />
                </header>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                        <input 
                            type="text" 
                            placeholder="SEARCH_BY_EMAIL_OR_NAME..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', backgroundColor: '#0D0D11', border: '1px solid #222', borderRadius: '8px', padding: '12px 15px 12px 45px', color: '#FFF', fontSize: '13px', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', backgroundColor: '#0D0D11', borderRadius: '8px', border: '1px solid #222', overflow: 'hidden' }}>
                        {(['all', 'pending', 'approved'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                style={{
                                    padding: '0 20px',
                                    border: 'none',
                                    backgroundColor: filterStatus === status ? '#0066FF' : 'transparent',
                                    color: filterStatus === status ? '#FFF' : '#555',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ backgroundColor: '#0D0D11', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '100px', textAlign: 'center', color: '#444' }}>
                            <FiActivity className="animate-spin" size={40} />
                            <div style={{ marginTop: '20px', fontSize: '11px', fontWeight: 900, letterSpacing: '2px' }}>LOADING_IDENTITY_STORE...</div>
                        </div>
                    ) : filteredProfiles.length === 0 ? (
                        <div style={{ padding: '100px', textAlign: 'center', color: '#444' }}>
                            <FiUser size={60} style={{ marginBottom: '20px', opacity: 0.2 }} />
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>NO_RECORDS_FOUND</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#0A0A0E', color: '#444', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left' }}>
                                    <th style={{ padding: '20px 30px' }}>USER_IDENTITY</th>
                                    <th style={{ padding: '20px 30px' }}>STATUS</th>
                                    <th style={{ padding: '20px 30px' }}>ROLE_ASSIGNMENT</th>
                                    <th style={{ padding: '20px 30px', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredProfiles.map((profile, i) => (
                                        <motion.tr
                                            key={profile.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{ borderBottom: '1px solid #16161c', opacity: processing === profile.id ? 0.5 : 1 }}
                                        >
                                            <td style={{ padding: '20px 30px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#FFF' }}>{profile.full_name || 'ANONYMOUS_USER'}</div>
                                                <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{profile.email}</div>
                                            </td>
                                            <td style={{ padding: '20px 30px' }}>
                                                <div style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '8px',
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    fontWeight: 900,
                                                    backgroundColor: profile.approved ? 'rgba(0, 255, 153, 0.1)' : 'rgba(255, 153, 0, 0.1)',
                                                    color: profile.approved ? '#00FF99' : '#FF9900',
                                                    border: `1px solid ${profile.approved ? 'rgba(0, 255, 153, 0.2)' : 'rgba(255, 153, 0, 0.2)'}`
                                                }}>
                                                    {profile.approved ? <FiCheck /> : <FiActivity />}
                                                    {profile.approved ? 'APPROVED' : 'PENDING'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 30px' }}>
                                                <select
                                                    value={profile.role}
                                                    onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                                    style={{ backgroundColor: '#141418', color: '#BBB', border: '1px solid #333', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                                                >
                                                    {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </td>
                                            <td style={{ padding: '20px 30px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    {!profile.approved && (
                                                        <button 
                                                            onClick={() => handleApprove(profile.id)}
                                                            style={{ backgroundColor: '#0066FF', color: '#FFF', border: 'none', padding: '8px 15px', borderRadius: '4px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
                                                        >
                                                            APPROVE
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleReject(profile.id)}
                                                        style={{ backgroundColor: 'transparent', color: '#FF3333', border: '1px solid rgba(255,51,51,0.2)', padding: '8px 15px', borderRadius: '4px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
                                                    >
                                                        REMOVE
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
            </div>
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default UsersPanel;
