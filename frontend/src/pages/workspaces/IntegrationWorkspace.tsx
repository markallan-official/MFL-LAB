import React, { useState, useEffect, useRef } from 'react';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    FiPlay,
    FiRefreshCw,
    FiCheckCircle,
    FiActivity,
    FiTerminal,
    FiLayers,
    FiDatabase,
    FiCpu,
    FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const IntegrationWorkspace: React.FC = () => {
    const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'building' | 'deploying' | 'success'>('idle');
    const [logs, setLogs] = useState<{ msg: string, type: string, time: string }[]>([
        { msg: 'ORCHESTRATOR_V1.0.4 INITIALIZED', type: 'core', time: new Date().toLocaleTimeString() },
        { msg: 'AWAITING_MODULE_SIGNAL...', type: 'core', time: new Date().toLocaleTimeString() }
    ]);
    const [progress, setProgress] = useState(0);
    const logEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const addLog = (msg: string, type: string = 'info') => {
        setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    const startAssembly = () => {
        setPipelineStatus('building');
        setProgress(0);
        addLog('INITIALIZING_ASSEMBLY_SEQUENCE', 'core');
        addLog('CONSUMING_DESIGNER_ASSETS...', 'sync');
        addLog('ACQUIRING_ANALYST_SPECIFICATIONS...', 'sync');
    };

    const resetPipeline = () => {
        setPipelineStatus('idle');
        setProgress(0);
        setLogs([
            { msg: 'PIPELINE_RESET_SUCCESSFUL', type: 'core', time: new Date().toLocaleTimeString() },
            { msg: 'AWAITING_NEW_BUILD_SIGNAL...', type: 'core', time: new Date().toLocaleTimeString() }
        ]);
    };

    useEffect(() => {
        let interval: any;
        if (pipelineStatus === 'building') {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setPipelineStatus('deploying');
                        addLog('BUILD_MATRIX_ASSEMBLY_COMPLETE', 'build');
                        addLog('PROPAGATING_TO_EDGE_NODES...', 'deploy');
                        return 100;
                    }
                    if (prev === 20) addLog('MERGING_VISUAL_CORE_WITH_SCHEMA', 'build');
                    if (prev === 50) addLog('RUNNING_UNIT_TEST_PROTOCOLS', 'build');
                    if (prev === 80) addLog('OPTIMIZING_NEURAL_WEIGHTS', 'build');
                    return prev + 5;
                });
            }, 200);
        } else if (pipelineStatus === 'deploying') {
            setTimeout(() => {
                setPipelineStatus('success');
                addLog('SYSTEM_LIVE: PRODUCTION_ENV_SYNCHRONIZED', 'success');
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [pipelineStatus]);

    const moduleStatus = [
        { name: 'Visual Core', status: 'READY', color: 'var(--primary-red)', icon: <FiLayers /> },
        { name: 'Schema Matrix', status: 'READY', color: 'var(--primary-blue)', icon: <FiDatabase /> },
        { name: 'QA Validation', status: 'SKIPPED', color: '#555', icon: <FiShield /> },
        { name: 'Neural Models', status: 'OPTIMIZED', color: 'var(--primary-red)', icon: <FiCpu /> },
    ];

    return (
        <WorkspaceLayout title="Build Orchestration" role="CI/CD PIPELINE" color="#9900FF">
            <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px', backgroundColor: '#0D0D11', border: '1px solid #333' }}>

                {/* Left: Module Source Matrix */}
                <div style={{ width: '320px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', backgroundColor: '#0A0A0E' }}>
                    <div style={{ padding: '25px', borderBottom: '1px solid #222', fontSize: '11px', fontWeight: 900, letterSpacing: '3px', color: '#555' }}>SOURCE_MATRIX</div>
                    <div style={{ flex: 1, padding: '20px' }}>
                        {moduleStatus.map((mod, i) => (
                            <div key={i} style={{ padding: '18px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '15px', border: '1px solid #222' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#BBB', fontWeight: 700 }}>
                                        <span style={{ color: mod.color }}>{mod.icon}</span>
                                        {mod.name.toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '9px', color: mod.color, fontWeight: 900, letterSpacing: '1px' }}>{mod.status}</span>
                                </div>
                                <div style={{ width: '100%', height: '3px', backgroundColor: '#111', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: mod.status === 'READY' || mod.status === 'OPTIMIZED' ? '100%' : '20%' }}
                                        style={{ height: '100%', backgroundColor: mod.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '20px', gap: '15px', display: 'flex', flexDirection: 'column', borderTop: '1px solid #222' }}>
                        <button
                            onClick={startAssembly}
                            disabled={pipelineStatus !== 'idle'}
                            style={{
                                width: '100%', padding: '15px', borderRadius: '6px', border: 'none',
                                backgroundColor: pipelineStatus === 'idle' ? '#9900FF' : '#222',
                                color: pipelineStatus === 'idle' ? 'white' : '#555',
                                fontWeight: 900, fontSize: '11px', letterSpacing: '2px',
                                cursor: pipelineStatus === 'idle' ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                transition: 'all 0.3s'
                            }}
                        >
                            <FiPlay /> INITIALIZE ASSEMBLY
                        </button>
                        {pipelineStatus === 'success' && (
                            <button
                                onClick={resetPipeline}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333',
                                    backgroundColor: 'transparent', color: '#AAA', fontWeight: 800, fontSize: '10px',
                                    letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '10px'
                                }}
                            >
                                <FiRefreshCw /> REFRESH PIPELINE
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Orchestrator Canvas */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Visual Progress Header */}
                    <div style={{ padding: '40px 60px', backgroundColor: '#0D0D11', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '50px' }}>
                        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                            <svg style={{ transform: 'rotate(-90deg)', width: '130px', height: '130px' }}>
                                <circle cx="65" cy="65" r="58" fill="none" stroke="#1a1a20" strokeWidth="10" />
                                <motion.circle cx="65" cy="65" r="58" fill="none" stroke="#9900FF" strokeWidth="10"
                                    strokeDasharray="364.4"
                                    animate={{ strokeDashoffset: 364.4 - (364.4 * progress) / 100 }}
                                    transition={{ type: 'spring', stiffness: 50 }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFF' }}>{progress}%</div>
                                <div style={{ fontSize: '8px', color: '#555', fontWeight: 900, letterSpacing: '1px', marginTop: '4px' }}>PROGRESS</div>
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#9900FF', fontSize: '10px', fontWeight: 900, letterSpacing: '4px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiActivity className={pipelineStatus === 'building' ? 'animate-pulse' : ''} /> PIPELINE_ORCHESTRATOR
                            </div>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: 900, color: '#FFF', letterSpacing: '-1px' }}>
                                {pipelineStatus === 'idle' ? 'READY_FOR_BUILD' :
                                    pipelineStatus === 'building' ? 'BUILDING_ARTIFACTS' :
                                        pipelineStatus === 'deploying' ? 'DEPLOYING_TO_EDGE' : 'PRODUCTION_ONLINE'}
                            </h2>
                            <p style={{ color: '#666', margin: 0, fontSize: '14px', maxWidth: '500px', lineHeight: 1.6 }}>
                                Automated synchronization of design, architecture, and code layers. End-to-end verification and deployment sequence initialization.
                            </p>
                        </div>
                    </div>

                    {/* Console Logs */}
                    <div style={{ flex: 1, backgroundColor: '#050507', padding: '30px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 30, right: 30, color: '#222', fontSize: '40px', fontWeight: 900 }}><FiTerminal /></div>
                        <div style={{ fontSize: '10px', color: '#333', marginBottom: '20px', letterSpacing: '2px', fontWeight: 900, borderLeft: '2px solid #9900FF', paddingLeft: '15px' }}>
                            STREAMS_v1.0.4 // ASSEMBLY_LOGS
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', fontFamily: '"Fira Code", monospace', fontSize: '13px', lineHeight: 2, paddingRight: '20px' }}>
                            {logs.map((log, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    gap: '20px',
                                    color: log.type === 'core' ? '#9900FF' :
                                        log.type === 'sync' ? 'var(--primary-blue)' :
                                            log.type === 'build' ? 'var(--primary-red)' :
                                                log.type === 'success' ? '#00FF00' : '#888',
                                    padding: '2px 0'
                                }}>
                                    <span style={{ opacity: 0.2, fontWeight: 400, width: '90px', flexShrink: 0 }}>[{log.time}]</span>
                                    <span style={{ fontWeight: 600 }}>{log.msg}</span>
                                    {log.type === 'success' && <FiCheckCircle style={{ marginTop: '5px' }} />}
                                </div>
                            ))}
                            <div ref={logEndRef} />
                            {(pipelineStatus === 'building' || pipelineStatus === 'deploying') && (
                                <div style={{ color: '#FFF', display: 'flex', gap: '20px' }}>
                                    <span style={{ opacity: 0.2 }}>[{new Date().toLocaleTimeString()}]</span>
                                    <span className="blinking-cursor">_</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                .blinking-cursor { animation: blink 1s infinite; }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            `}</style>
        </WorkspaceLayout>
    );
};

export default IntegrationWorkspace;
