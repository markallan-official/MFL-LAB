import React from 'react';
import { useNavigate } from 'react-router-dom';

const WorkspaceLayout: React.FC<{ title: string, role: string, color: string, children: React.ReactNode }> = ({ title, role, color, children }) => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#1E1E24', minHeight: '100vh', color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}>
            <nav style={{ padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${color}33`, backgroundColor: 'rgba(30, 30, 36, 0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: 'none', border: 'none', color: '#A0A0A0', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        ← Back to Matrix
                    </button>
                    <div style={{ height: '24px', width: '1px', backgroundColor: '#333' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: color, fontSize: '20px' }}>•</span>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, letterSpacing: '1px' }}>{title}</h2>
                    </div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: color, border: `1px solid ${color}`, padding: '4px 12px', borderRadius: '12px', letterSpacing: '1px' }}>
                    ROLE: {role}
                </div>
            </nav>
            <main style={{ padding: '30px', height: 'calc(100vh - 70px)', boxSizing: 'border-box' }}>
                {/* Glassmorphic Container for Workspace Tools */}
                <div style={{
                    backgroundColor: 'rgba(42, 42, 53, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    height: '100%',
                    padding: '30px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                        <h2 style={{ color: color, margin: '0 0 10px 0', fontSize: '24px' }}>{title} Terminal</h2>
                        <p style={{ color: '#A0A0A0', margin: 0 }}>Isolated environment for {role.toLowerCase()} operations.</p>
                    </header>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WorkspaceLayout;
