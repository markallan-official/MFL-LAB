import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    FiLayers,
    FiDatabase,
    FiShield,
    FiCpu,
    FiLink,
    FiEye,
    FiSettings,
    FiLogOut,
    FiLock
} from 'react-icons/fi';

const Dashboard: React.FC = () => {
    const { user, isAdmin, assignedWorkspace, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Only auto-redirect assigned staff to their specific terminal
        if (!isAdmin && assignedWorkspace && assignedWorkspace !== 'unassigned') {
            navigate(`/workspaces/${assignedWorkspace}`, { replace: true });
        }
    }, [isAdmin, assignedWorkspace, navigate]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const modules = [
        { id: 'analyst', title: 'SYSTEM ANALYST', path: '/workspaces/analyst', icon: <FiDatabase />, color: 'var(--primary-blue)', desc: 'Specification Matrix' },
        { id: 'designer', title: 'UX DESIGNER', path: '/workspaces/designer', icon: <FiLayers />, color: 'var(--primary-red)', desc: 'Visual Core' },
        { id: 'qa', title: 'QA TERMINAL', path: '/workspaces/qa', icon: <FiShield />, color: 'var(--primary-blue)', desc: 'Stability Guard' },
        { id: 'ai-builder', title: 'AI BUILDER', path: '/workspaces/ai-builder', icon: <FiCpu />, color: 'var(--primary-red)', desc: 'Neural Engine' },
        { id: 'integration', title: 'INTEGRATOR', path: '/workspaces/integration', icon: <FiLink />, color: 'var(--primary-blue)', desc: 'Assembly Layer' },
        { id: 'client', title: 'CLIENT PORTAL', path: '/client', icon: <FiEye />, color: 'var(--accent-cyan)', desc: 'View Layer' },
    ];

    // Filter based on admin/access
    const visibleModules = modules.filter(m => isAdmin || m.id === assignedWorkspace);

    // Add Admin Panel if super admin
    if (isAdmin) {
        visibleModules.push({ id: 'admin', title: 'ADMIN CONTROL', path: '/admin', icon: <FiSettings />, color: '#666', desc: 'System Core' });
    }

    // Split modules into rows for the honeycomb effect
    const row1 = visibleModules.slice(0, 3);
    const row2 = visibleModules.slice(3, 5);
    const row3 = visibleModules.slice(5);

    const Hexagon = ({ item }: { item: any }) => (
        <div
            className="hex-container"
            onClick={() => navigate(item.path)}
        >
            <div className="hexagon-shape hex-glow-animation" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(10, 10, 14, 0.9)',
                border: `2px solid ${item.color}`,
                boxShadow: `0 0 30px ${item.color}22`,
                backdropFilter: 'blur(15px)',
                zIndex: 1
            }} />

            <div className="hexagon-shape" style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                bottom: '8px',
                border: `1px solid ${item.color}33`,
                zIndex: 2
            }} />

            <div style={{
                position: 'relative',
                zIndex: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '15px',
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: `drop-shadow(0 0 15px ${item.color}66)`
                }}>
                    {item.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '3px', fontWeight: 900, color: '#FFF' }}>
                    {item.title}
                </h3>
                <div style={{ fontSize: '9px', marginTop: '8px', color: item.color, opacity: 0.8, fontWeight: 700, letterSpacing: '1px' }}>
                    {item.desc.toUpperCase()}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-deep)' }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
                opacity: 0.5
            }} />

            <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '50%', height: '50%', backgroundColor: 'var(--primary-blue)', filter: 'blur(180px)', opacity: 0.08 }} className="animate-pulse-slow" />
            <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '50%', height: '50%', backgroundColor: 'var(--primary-red)', filter: 'blur(180px)', opacity: 0.08 }} className="animate-pulse-slow" />

            <nav style={{ padding: '30px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div className="hexagon-shape hex-glow-animation" style={{ width: '45px', height: '50px', backgroundColor: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontWeight: 900, color: 'white', fontSize: '20px', letterSpacing: '-1px' }}>M</span>
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '22px', letterSpacing: '5px', fontWeight: 900, color: '#FFF' }}>
                            ASSEMBLY <span style={{ color: 'var(--primary-red)' }}>MATRIX</span>
                        </h1>
                        <div style={{ fontSize: '9px', color: 'var(--primary-blue)', letterSpacing: '3px', fontWeight: 800, marginTop: '2px' }}>
                            ENCRYPTED NEURAL GATEWAY // ACTIVEV.1.0
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 800 }}>OPS_COMMANDER</div>
                        <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--primary-blue)', letterSpacing: '1px' }}>
                            {user?.email?.split('@')[0].toUpperCase()}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--primary-red)',
                            border: '2px solid var(--primary-red)',
                            padding: '10px 24px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 900,
                            letterSpacing: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <FiLogOut /> DISCONNECT
                    </button>
                </div>
            </nav>

            <main className="assembly-matrix-grid" style={{ position: 'relative', zIndex: 5 }}>
                <div style={{ textAlign: 'center', marginBottom: '80px', marginTop: '30px' }}>
                    <h2 style={{ fontSize: '11px', letterSpacing: '10px', color: 'var(--text-muted)', marginBottom: '15px', fontWeight: 900 }}>
                        SELECT INTERFACE_NODE
                    </h2>
                    <p style={{ fontSize: '15px', maxWidth: '700px', margin: '0 auto', opacity: 0.6, fontWeight: 400, lineHeight: 1.8, letterSpacing: '0.5px' }}>
                        Operational environment synchronization confirmed. Authorized credentials detected. Select any active module terminal below to initialize operational protocols.
                    </p>
                </div>

                <div className="hex-grid">
                    <div className="hex-row">
                        {row1.map(item => <Hexagon key={item.id} item={item} />)}
                    </div>
                    <div className="hex-row" style={{ marginTop: '-65px' }}>
                        {row2.map(item => <Hexagon key={item.id} item={item} />)}
                    </div>
                    <div className="hex-row" style={{ marginTop: '-65px' }}>
                        {row3.map(item => <Hexagon key={item.id} item={item} />)}
                    </div>
                </div>

                {!isAdmin && !assignedWorkspace && (
                    <div style={{
                        marginTop: '120px',
                        backgroundColor: 'rgba(255, 26, 26, 0.08)',
                        border: '2px solid var(--primary-red)',
                        padding: '25px 50px',
                        borderRadius: '4px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ color: 'var(--primary-red)', fontWeight: 900, fontSize: '13px', letterSpacing: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                            <FiLock /> ASSIGNMENT PROTOCOL PENDING
                        </div>
                        <p style={{ fontSize: '11px', marginTop: '12px', opacity: 0.8, lineHeight: 1.6, letterSpacing: '1px' }}>
                            System administrator manual authorization required for terminal access. Please wait for node synchronization.
                        </p>
                    </div>
                )}
            </main>

            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '15px 60px',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '2px',
                fontWeight: 700,
                backgroundColor: 'rgba(5, 5, 7, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 20
            }}>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <div>MATRIX_STATUS: <span style={{ color: '#00FF00' }}>AUTHORIZED</span></div>
                    <div>LATENCY: 14MS</div>
                    <div>ENCRYPTION: QUANTUM_V4</div>
                </div>
                <div>© 2026 MFL LABS // ALL OPERATIONS LOGGED</div>
            </div>
        </div>
    );
};

export default Dashboard;

