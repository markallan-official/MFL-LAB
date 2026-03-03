import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
    FiBox,
    FiCpu,
    FiLayers,
    FiShield,
    FiZap,
    FiActivity,
    FiGlobe,
    FiArrowRight,
    FiCheckCircle,
    FiAlertTriangle,
    FiPlus,
    FiLink,
    FiFileText
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import HealthBadge from '../components/HealthBadge';

interface AssemblyData {
    designs: any[];
    architecture: any[];
    testing: any[];
    ai: any[];
    integration: any[];
}

const AssemblyPanel: React.FC = () => {
    const { session } = useAuth();
    const [data, setData] = useState<AssemblyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [assembling, setAssembling] = useState(false);
    const [assembledResult, setAssembledResult] = useState<any>(null);
    const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

    useEffect(() => {
        fetchSummary();
    }, [session]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/assembly/summary', {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error('Fetch assembly error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleComponent = (id: string) => {
        setSelectedComponents(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleAssemble = async () => {
        if (selectedComponents.length === 0) return;
        
        try {
            setAssembling(true);
            const response = await axios.post('/api/v1/assembly/combine', 
                { components: selectedComponents },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            
            setTimeout(() => {
                setAssembledResult(response.data);
                setAssembling(false);
            }, 2500); // Animation buffer
        } catch (error) {
            console.error('Assembly error:', error);
            setAssembling(false);
        }
    };

    const sections = [
        { id: 'designs', label: 'DESIGN_ASSETS', icon: <FiLayers />, color: '#0066FF' },
        { id: 'architecture', label: 'ARCHITECTURE_DOCS', icon: <FiFileText />, color: '#9933FF' },
        { id: 'testing', label: 'QA_REPORTS', icon: <FiShield />, color: '#FF33CC' },
        { id: 'ai', label: 'AI_MODELS', icon: <FiCpu />, color: '#00FFFF' },
        { id: 'integration', label: 'INTEGRATION_BUILDS', icon: <FiZap />, color: '#FFFF00' }
    ];

    if (loading) {
        return (
            <div style={{ backgroundColor: '#050507', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066FF' }}>
                <FiActivity className="animate-spin" size={40} />
                <div style={{ marginLeft: '20px', fontSize: '12px', fontWeight: 900, letterSpacing: '4px' }}>CALIBRATING_ASSEMBLY_MATRIX...</div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#050507', minHeight: '100vh', padding: '40px', color: '#F5F5F5' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ borderBottom: '1px solid #222', paddingBottom: '30px', marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ color: '#0066FF', fontSize: '10px', fontWeight: 900, letterSpacing: '4px', marginBottom: '15px' }}>
                            MFL_LABS // ASSEMBLY_PANEL
                        </div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>Master Integration Core</h1>
                        <p style={{ color: '#555', marginTop: '10px', fontSize: '13px' }}>Combine multi-disciplinary outputs into a unified production assembly.</p>
                    </div>
                    <HealthBadge compact />
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                    {/* Components Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {sections.map(section => (
                            <div key={section.id} style={{ backgroundColor: '#0D0D11', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 30px', borderBottom: '1px solid #222', backgroundColor: '#0A0A0E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ margin: 0, fontSize: '11px', fontWeight: 900, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '15px', color: section.color }}>
                                        {section.icon} {section.label}
                                    </h2>
                                    <span style={{ fontSize: '10px', color: '#444' }}>{data?.[section.id as keyof AssemblyData]?.length || 0} READY</span>
                                </div>
                                <div style={{ padding: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {data?.[section.id as keyof AssemblyData]?.length === 0 ? (
                                        <div style={{ padding: '20px', color: '#333', fontSize: '11px', fontWeight: 800 }}>NO_COMPONENTS_VALIDATED_FOR_ASSEMBLY</div>
                                    ) : (
                                        data?.[section.id as keyof AssemblyData]?.map((item: any) => (
                                            <motion.div
                                                key={item.id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => toggleComponent(item.id)}
                                                style={{
                                                    backgroundColor: '#141418',
                                                    border: `1px solid ${selectedComponents.includes(item.id) ? section.color : '#222'}`,
                                                    padding: '15px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    width: '200px',
                                                    transition: 'all 0.2s',
                                                    boxShadow: selectedComponents.includes(item.id) ? `0 0 20px ${section.color}22` : 'none'
                                                }}
                                            >
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.name || item.title || `BUILD_${item.build_number}`}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{item.created_by?.full_name || 'SYSTEM'}</span>
                                                    <FiCheckCircle color={selectedComponents.includes(item.id) ? section.color : '#222'} />
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Assembly Sidebar */}
                    <div style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
                        <div style={{ backgroundColor: '#0D0D11', borderRadius: '12px', border: '1px solid #222', padding: '30px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '2px', color: '#FFF', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FiBox color="#0066FF" /> ASSEMBLY_MANIFEST
                            </h2>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px', minHeight: '100px' }}>
                                {selectedComponents.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#333', border: '2px dashed #222', borderRadius: '8px' }}>
                                        <FiPlus size={24} style={{ marginBottom: '10px' }} />
                                        <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '1px' }}>SELECT_COMPONENTS_TO_BEGIN</div>
                                    </div>
                                ) : (
                                    selectedComponents.map(id => (
                                        <div key={id} style={{ fontSize: '11px', color: '#BBB', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FiLink color="#0066FF" size={12} />
                                            <span>COMP_ID: {id.substring(0, 8).toUpperCase()}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={handleAssemble}
                                disabled={selectedComponents.length === 0 || assembling}
                                style={{
                                    width: '100%',
                                    backgroundColor: selectedComponents.length === 0 ? '#111' : '#0066FF',
                                    color: selectedComponents.length === 0 ? '#333' : '#FFF',
                                    border: 'none',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 900,
                                    letterSpacing: '2px',
                                    cursor: selectedComponents.length === 0 || assembling ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '15px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {assembling ? (
                                    <>
                                        <FiActivity className="animate-spin" /> SYNCHRONIZING...
                                    </>
                                ) : (
                                    <>
                                        ASSEMBLE_MASTER <FiZap />
                                    </>
                                )}
                            </button>
                        </div>

                        <AnimatePresence>
                            {assembledResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: '30px', backgroundColor: 'rgba(0, 255, 153, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 255, 153, 0.2)', padding: '25px' }}
                                >
                                    <div style={{ color: '#00FF99', fontWeight: 900, fontSize: '11px', letterSpacing: '2px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FiCheckCircle /> ASSEMBLY_SUCCESSFUL
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFF', marginBottom: '10px' }}>
                                        {assembledResult.assembly_id}
                                    </div>
                                    <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{assembledResult.message}</p>
                                    <button 
                                        onClick={() => setAssembledResult(null)}
                                        style={{ marginTop: '20px', background: 'none', border: 'none', color: '#00FF99', fontSize: '10px', fontWeight: 900, cursor: 'pointer', padding: 0 }}
                                    >
                                        DISMISS_RESULT
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AssemblyPanel;
