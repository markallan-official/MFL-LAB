import React, { useState, useEffect } from 'react';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    FiCpu,
    FiActivity,
    FiPlay,
    FiSquare,
    FiZap,
    FiDatabase,
    FiLayers,
    FiTrendingUp,
    FiTerminal,
    FiCheckCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AiBuilderWorkspace: React.FC = () => {
    const [isTraining, setIsTraining] = useState(true);
    const [epoch, setEpoch] = useState(42);
    const [metrics, setMetrics] = useState({ loss: 0.3995, acc: 90.1, gpu1: 98, gpu2: 85 });
    const [logs, setLogs] = useState<{ msg: string, type: string, time: string }[]>([
        { msg: "LOADING_DATASET: 'mfl_corpus_v2'...", type: 'sys', time: '10:42:01' },
        { msg: "TOKENIZING_DOCUMENTS: 1.4M_ENTRIES", type: 'sys', time: '10:42:05' },
        { msg: "INITIALIZING_WEIGHTS: XAVIER_UNIFORM", type: 'sys', time: '10:42:18' },
        { msg: "EPOCH_40: LOSS=0.4281 ACC=89.2%", type: 'train', time: '10:42:20' },
        { msg: "EPOCH_41: LOSS=0.4102 ACC=89.7%", type: 'train', time: '10:43:10' },
        { msg: "EPOCH_42: LOSS=0.3995 ACC=90.1%", type: 'train', time: '10:44:00' }
    ]);

    useEffect(() => {
        let interval: any;
        if (isTraining) {
            interval = setInterval(() => {
                setEpoch(prev => prev + 1);
                setMetrics(prev => ({
                    loss: Math.max(0.1, prev.loss - 0.005),
                    acc: Math.min(99.9, prev.acc + 0.2),
                    gpu1: 95 + Math.random() * 5,
                    gpu2: 80 + Math.random() * 10
                }));
                const newTime = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setLogs(prev => [...prev.slice(-10), {
                    msg: `EPOCH_${epoch + 1}: LOSS=${(metrics.loss - 0.005).toFixed(4)} ACC=${(metrics.acc + 0.2).toFixed(1)}%`,
                    type: 'train',
                    time: newTime
                }]);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isTraining, epoch, metrics]);

    return (
        <WorkspaceLayout title="Neural Training Lab" role="AI BUILDER" color="#FF9900">
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid #333' }}>

                {/* Training Visualization Area */}
                <div style={{ flex: 2, backgroundColor: '#0D0D11', borderBottom: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 25, left: 25, backgroundColor: 'rgba(20,20,24,0.9)', backdropFilter: 'blur(10px)', padding: '12px 25px', borderRadius: '8px', border: '1px solid #333', color: '#FFF', display: 'flex', gap: '30px', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiCpu color="var(--primary-red)" />
                            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>MODEL: <strong style={{ color: 'var(--primary-red)' }}>NLP_TRANSFORMER_V4</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiActivity color={isTraining ? '#00FF00' : '#555'} className={isTraining ? 'animate-pulse' : ''} />
                            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>STATUS: <strong style={{ color: isTraining ? '#00FF00' : '#555' }}>{isTraining ? `TRAINING_EPOCH_${epoch}` : 'HALTED'}</strong></span>
                        </div>
                    </div>

                    {/* Pipeline Architecture Graph */}
                    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundImage: 'radial-gradient(rgba(255,153,0,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            <motion.path
                                d="M 150 200 L 350 200 L 550 200 L 750 200"
                                fill="none"
                                stroke="#222"
                                strokeWidth="2"
                            />
                            {isTraining && (
                                <motion.path
                                    d="M 150 200 L 750 200"
                                    fill="none"
                                    stroke="var(--primary-red)"
                                    strokeWidth="2"
                                    strokeDasharray="10,10"
                                    animate={{ strokeDashoffset: -100 }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                />
                            )}
                        </svg>

                        <div style={{ position: 'absolute', top: '50%', left: '150px', transform: 'translateY(-50%)', display: 'flex', gap: '100px', alignItems: 'center' }}>
                            {[
                                { name: 'DATASET', icon: <FiDatabase />, color: '#555' },
                                { name: 'ENCODER', icon: <FiLayers />, color: '#555' },
                                { name: 'ATTENTION', icon: <FiZap />, color: 'var(--primary-red)', active: true },
                                { name: 'OUTPUT', icon: <FiTrendingUp />, color: '#222' }
                            ].map((node, i) => (
                                <motion.div
                                    key={i}
                                    style={{
                                        width: '100px', height: '120px', backgroundColor: '#141418',
                                        border: node.active ? '2px solid var(--primary-red)' : '1px solid #333',
                                        borderRadius: '8px', display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', gap: '15px'
                                    }}
                                >
                                    <div style={{ fontSize: '28px', color: node.active ? 'var(--primary-red)' : '#444' }}>{node.icon}</div>
                                    <div style={{ fontSize: '9px', fontWeight: 900, color: node.active ? '#FFF' : '#444', letterSpacing: '2px' }}>{node.name}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Metrics Console */}
                <div style={{ height: '300px', display: 'flex', backgroundColor: '#0A0A0E' }}>
                    {/* Live Logs */}
                    <div style={{ flex: 2, padding: '25px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '10px', color: '#444', fontWeight: 900, letterSpacing: '2px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiTerminal color="var(--primary-red)" /> NEURAL_CONTRL_UNIT_V4
                        </div>
                        <div style={{ flex: 1, backgroundColor: '#050507', borderRadius: '6px', padding: '20px', overflowY: 'auto', fontFamily: '"Fira Code", monospace', fontSize: '12px', lineHeight: 2 }}>
                            {logs.map((log, i) => (
                                <div key={i} style={{ display: 'flex', gap: '15px', color: log.type === 'train' ? 'var(--primary-red)' : '#444' }}>
                                    <span style={{ opacity: 0.3 }}>[{log.time}]</span>
                                    <span style={{ fontWeight: 600 }}>{log.msg}</span>
                                    {log.type === 'train' && epoch > 45 && <FiCheckCircle style={{ marginTop: '3px', fontSize: '10px' }} />}
                                </div>
                            ))}
                            {isTraining && <div style={{ color: '#FFF' }} className="blinking-cursor">_</div>}
                        </div>
                    </div>

                    {/* GPU Metrics */}
                    <div style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', backgroundColor: '#0D0D11' }}>
                        <div style={{ fontSize: '10px', color: '#444', fontWeight: 900, letterSpacing: '2px', marginBottom: '20px' }}>HARDWARE_UTIL_TELEMETRY</div>

                        {[{ label: 'A100_NODE_1', val: metrics.gpu1, temp: 78, mem: '38/40' },
                        { label: 'A100_NODE_2', val: metrics.gpu2, temp: 72, mem: '32/40' }].map((gpu, i) => (
                            <div key={i} style={{ marginBottom: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', fontWeight: 700 }}>
                                    <span style={{ color: '#BBB' }}>{gpu.label}</span>
                                    <span style={{ color: gpu.val > 90 ? '#FF3333' : 'var(--primary-red)' }}>{gpu.val.toFixed(0)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', backgroundColor: '#1a1a20', borderRadius: '2px', overflow: 'hidden' }}>
                                    <motion.div
                                        animate={{ width: `${gpu.val}%` }}
                                        style={{ height: '100%', backgroundColor: gpu.val > 90 ? '#FF3333' : 'var(--primary-red)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#444', marginTop: '6px', fontWeight: 700 }}>
                                    <span>{gpu.temp}°C</span>
                                    <span>{gpu.mem} GB VRAM</span>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setIsTraining(!isTraining)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '4px', border: 'none',
                                    backgroundColor: isTraining ? '#FF3333' : '#00FF00',
                                    color: isTraining ? 'white' : 'black', fontWeight: 900, fontSize: '11px',
                                    letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {isTraining ? <><FiSquare /> HALT</> : <><FiPlay /> RESUME</>}
                            </button>
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

export default AiBuilderWorkspace;
