import React, { useState } from 'react';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    FiPlay,
    FiZap,
    FiCheckCircle,
    FiXCircle,
    FiSearch,
    FiShield,
    FiGlobe,
    FiBox,
    FiLock,
    FiTerminal,
    FiActivity
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const QaWorkspace: React.FC = () => {
    const [running, setRunning] = useState(false);
    const [logs, setLogs] = useState<{ msg: string, type: string }[]>([
        { msg: '[SYSTEM] Test execution engine ready.', type: 'sys' },
        { msg: '[SYSTEM] Connected to MFL LABS staging environment.', type: 'sys' }
    ]);
    const [testCases, setTestCases] = useState([
        { id: 'AUTH-01', desc: 'Login with valid credentials', type: 'E2E', lastRun: '2 mins ago', status: 'passed' },
        { id: 'AUTH-02', desc: 'Prevent login for unapproved users', type: 'Integration', lastRun: '2 mins ago', status: 'passed' },
        { id: 'AUTH-03', desc: 'JWT token expiration handling', type: 'Unit', lastRun: 'Just now', status: 'failed' },
        { id: 'UI-01', desc: 'Dashboard renders 5 workspace cards', type: 'Component', lastRun: '1 hour ago', status: 'passed' },
        { id: 'DATA-01', desc: 'Supabase RLS prevents unauthorized reads', type: 'Security', lastRun: '1 day ago', status: 'passed' }
    ]);

    const runTests = () => {
        setRunning(true);
        setLogs(prev => [...prev, { msg: '[INFO] DISPATCHING TEST SUITE: USER_AUTHENTICATION_FLOW...', type: 'info' }]);

        setTimeout(() => {
            setLogs(prev => [...prev, { msg: '[PASS] √ Login with valid credentials', type: 'pass' }]);
            setTestCases(prev => prev.map(tc => tc.id === 'AUTH-01' ? { ...tc, lastRun: 'Just now' } : tc));
        }, 800);

        setTimeout(() => {
            setLogs(prev => [...prev, { msg: '[PASS] √ Prevent login for unapproved users', type: 'pass' }]);
            setTestCases(prev => prev.map(tc => tc.id === 'AUTH-02' ? { ...tc, lastRun: 'Just now' } : tc));
        }, 1600);

        setTimeout(() => {
            setLogs(prev => [...prev, { msg: '[FAIL] × JWT token expiration handling (Timeout after 5000ms)', type: 'fail' }]);
            setRunning(false);
        }, 2500);
    };

    return (
        <WorkspaceLayout title="Quality Assurance Matrix" role="TEST_ENGINEER" color="#00FF99">
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid #333' }}>

                {/* Top Section: Test Matrix */}
                <div style={{ flex: 3, backgroundColor: '#0D0D11', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', backgroundColor: '#0A0A0E' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ backgroundColor: 'rgba(0,255,153,0.05)', padding: '10px 20px', borderRadius: '4px', border: '1px solid rgba(0,255,153,0.2)', color: '#00FF99', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiCheckCircle /> 32_STABLE
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,51,51,0.05)', padding: '10px 20px', borderRadius: '4px', border: '1px solid rgba(255,51,51,0.2)', color: '#FF3333', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiXCircle /> 1_FAILURE
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ position: 'relative' }}>
                                <FiSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                                <input type="text" placeholder="SEARCH_TESTS..." style={{ background: '#141418', border: '1px solid #333', borderRadius: '4px', padding: '10px 15px 10px 40px', color: '#FFF', fontSize: '12px', width: '250px', outline: 'none' }} />
                            </div>
                            <button
                                onClick={runTests}
                                disabled={running}
                                style={{
                                    backgroundColor: running ? '#222' : '#00FF99',
                                    color: running ? '#000' : '#000',
                                    border: 'none', padding: '10px 30px',
                                    borderRadius: '4px', cursor: running ? 'not-allowed' : 'pointer',
                                    fontWeight: 900, fontSize: '11px', letterSpacing: '2px', display: 'flex', gap: '10px', alignItems: 'center',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {running ? <FiZap className="animate-pulse" /> : <FiPlay />} {running ? 'EXECUTING...' : 'RUN_TEST_SUITE'}
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 30px' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', textAlign: 'left', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ color: '#444', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '2px', fontWeight: 900 }}>
                                    <th style={{ padding: '20px 15px' }}>ID</th>
                                    <th style={{ padding: '20px 15px' }}>DESCRIPTION</th>
                                    <th style={{ padding: '20px 15px' }}>LAYER</th>
                                    <th style={{ padding: '20px 15px' }}>LAST_VERIFIED</th>
                                    <th style={{ padding: '20px 15px', textAlign: 'right' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {testCases.map((tc, i) => (
                                        <motion.tr
                                            key={tc.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            style={{ backgroundColor: '#141418', borderRadius: '8px' }}
                                        >
                                            <td style={{ padding: '20px 15px', color: '#00FF99', fontFamily: '"Fira Code", monospace', fontWeight: 700, borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>{tc.id}</td>
                                            <td style={{ padding: '20px 15px', color: '#BBB', fontWeight: 500 }}>{tc.desc}</td>
                                            <td style={{ padding: '20px 15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '11px', fontWeight: 700 }}>
                                                    {tc.type === 'E2E' && <FiGlobe />}
                                                    {tc.type === 'Integration' && <FiBox />}
                                                    {tc.type === 'Unit' && <FiActivity />}
                                                    {tc.type === 'Security' && <FiLock />}
                                                    {tc.type === 'Component' && <FiShield />}
                                                    {tc.type.toUpperCase()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 15px', color: '#555', fontWeight: 700, fontSize: '11px' }}>{tc.lastRun.toUpperCase()}</td>
                                            <td style={{ padding: '20px 15px', textAlign: 'right', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                                                {tc.status === 'passed' ? (
                                                    <span style={{ color: '#00FF99', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', fontWeight: 900, fontSize: '11px', letterSpacing: '1px' }}>
                                                        <FiCheckCircle /> PASSED
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#FF3333', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', fontWeight: 900, fontSize: '11px', letterSpacing: '1px' }}>
                                                        <FiXCircle /> FAILED
                                                    </span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Section: Execution Terminal */}
                <div style={{ flex: 1, backgroundColor: '#050507', borderTop: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 30px', backgroundColor: '#0A0A0E', fontSize: '10px', color: '#333', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111', fontWeight: 900, letterSpacing: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FiTerminal color="#00FF99" /> TEST_RUNTIME_OUTPUT</span>
                        <span>V2.4.1 // NODE_TEST_RUNNER</span>
                    </div>
                    <div style={{ flex: 1, padding: '25px 30px', overflowY: 'auto', fontFamily: '"Fira Code", monospace', fontSize: '13px', lineHeight: 2 }}>
                        {logs.map((log, idx) => (
                            <div key={idx} style={{
                                color: log.type === 'pass' ? '#00FF99' :
                                    log.type === 'fail' ? '#FF3333' :
                                        log.type === 'info' ? 'var(--primary-blue)' : '#444',
                                marginBottom: '6px',
                                display: 'flex',
                                gap: '15px'
                            }}>
                                <span style={{ opacity: 0.2, fontWeight: 400 }}>[{new Date().toLocaleTimeString()}]</span>
                                <span style={{ fontWeight: 600 }}>{log.msg}</span>
                            </div>
                        ))}
                        {running && (
                            <div style={{ color: '#FFF', display: 'flex', gap: '15px' }}>
                                <span style={{ opacity: 0.2 }}>[{new Date().toLocaleTimeString()}]</span>
                                <span className="blinking-cursor">_</span>
                            </div>
                        )}
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

export default QaWorkspace;
