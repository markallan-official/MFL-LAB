import React, { useState } from 'react';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    FiPlus,
    FiGitBranch,
    FiServer,
    FiGlobe,
    FiDatabase,
    FiCheckCircle,
    FiAlertCircle,
    FiCode,
    FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AnalystWorkspace: React.FC = () => {
    const [nodes, setNodes] = useState([
        { id: 1, name: 'Client App', type: 'client', x: 50, y: 110, icon: <FiGlobe /> },
        { id: 2, name: 'API Gateway', type: 'server', x: 350, y: 210, icon: <FiServer /> },
        { id: 3, name: 'Auth Service', type: 'server', x: 350, y: 310, icon: <FiShield /> },
        { id: 4, name: 'PostgreSQL', type: 'db', x: 750, y: 110, icon: <FiDatabase /> }
    ]);

    const [yamlContent, setYamlContent] = useState(`openapi: 3.0.0
info:
  title: MFL LABS API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List Users
      responses:
        '200':
          description: Success`);

    const [isValid, setIsValid] = useState(true);

    const handleYamlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setYamlContent(val);
        // Simple mock validation (check for common YAML keys)
        setIsValid(val.includes('openapi:') && val.includes('paths:'));
    };

    const addNode = () => {
        const newId = nodes.length + 1;
        setNodes([...nodes, {
            id: newId,
            name: `Microservice ${newId}`,
            type: 'server',
            x: 100 + (nodes.length * 20),
            y: 100 + (nodes.length * 20),
            icon: <FiServer />
        }]);
    };

    return (
        <WorkspaceLayout title="Architecture & Planning" role="SYSTEM ANALYST" color="#0066FF">
            <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px', backgroundColor: '#0D0D11', border: '1px solid #333' }}>

                {/* Graph Area */}
                <div style={{ flex: 2, borderRight: '1px solid #333', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', backgroundColor: 'rgba(20,20,24,0.9)', backdropFilter: 'blur(10px)', zIndex: 10, position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={addNode}
                                style={{ background: 'var(--primary-blue)', border: 'none', color: '#FFF', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '11px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FiPlus /> ADD NODE
                            </button>
                            <button style={{ background: 'transparent', border: '1px solid #444', color: '#888', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '11px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiGitBranch /> CONNECT
                            </button>
                        </div>
                        <div style={{ color: 'var(--primary-blue)', fontSize: '10px', fontWeight: 900, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', backgroundColor: '#00FF00', borderRadius: '50%', boxShadow: '0 0 10px #00FF00' }}></div>
                            SYSTEM_GRAPH ACTIVE
                        </div>
                    </div>

                    {/* Node Graph Interactive */}
                    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            {nodes.slice(1).map((node, i) => (
                                <motion.path
                                    key={`line-${node.id}`}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    d={`M ${nodes[0].x + 50} ${nodes[0].y + 40} C ${nodes[0].x + 150} ${nodes[0].y + 40}, ${node.x - 50} ${node.y + 40}, ${node.x} ${node.y + 40}`}
                                    fill="transparent"
                                    stroke={i === 0 ? 'var(--primary-blue)' : '#222'}
                                    strokeWidth="2"
                                    strokeDasharray={i === 0 ? "5,5" : "0"}
                                />
                            ))}
                        </svg>

                        <AnimatePresence>
                            {nodes.map(node => (
                                <motion.div
                                    key={node.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{
                                        position: 'absolute',
                                        top: node.y,
                                        left: node.x,
                                        width: '140px',
                                        padding: '15px',
                                        backgroundColor: '#141418',
                                        border: node.id === 2 ? '2px solid var(--primary-blue)' : '1px solid #333',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                        zIndex: 5,
                                        cursor: 'grab'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '24px',
                                        marginBottom: '10px',
                                        color: node.id === 2 ? 'var(--primary-blue)' : '#555',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}>
                                        {node.icon}
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#FFF', letterSpacing: '1px' }}>{node.name.toUpperCase()}</div>
                                    <div style={{ fontSize: '9px', color: '#555', marginTop: '5px' }}>NODE_ID: {node.id.toString().padStart(3, '0')}</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* API Spec Editor */}
                <div style={{ flex: 1, backgroundColor: '#050507', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 25px', borderBottom: '1px solid #222', fontSize: '11px', fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A0A0E', letterSpacing: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FiCode color="var(--primary-blue)" /> OPENAPI.YAML</span>
                        {isValid ? (
                            <span style={{ color: '#00FF00', display: 'flex', alignItems: 'center', gap: '5px' }}><FiCheckCircle /> VALID</span>
                        ) : (
                            <span style={{ color: '#FF3333', display: 'flex', alignItems: 'center', gap: '5px' }}><FiAlertCircle /> ERROR</span>
                        )}
                    </div>
                    <textarea
                        value={yamlContent}
                        onChange={handleYamlChange}
                        spellCheck={false}
                        style={{
                            flex: 1,
                            padding: '25px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#A0A0A0',
                            fontFamily: '"Fira Code", monospace',
                            fontSize: '13px',
                            lineHeight: 1.8,
                            resize: 'none',
                            outline: 'none',
                        }}
                    />
                    <div style={{ padding: '15px 25px', borderTop: '1px solid #222', backgroundColor: '#0A0A0E', fontSize: '9px', color: '#444', letterSpacing: '1px' }}>
                        UTF-8 // ARCHITECTURE LAYER // V1.0.4
                    </div>
                </div>

            </div>
        </WorkspaceLayout>
    );
};

export default AnalystWorkspace;
