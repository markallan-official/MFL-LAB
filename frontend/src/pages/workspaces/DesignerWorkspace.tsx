import React, { useState } from 'react';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    FiMousePointer,
    FiMove,
    FiSquare,
    FiCircle as FiCircleIcon,
    FiType,
    FiEdit2,
    FiPlus,
    FiEye,
    FiLock,
    FiImage
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const DesignerWorkspace: React.FC = () => {
    const [activeTool, setActiveTool] = useState('select');
    const [selectedId, setSelectedId] = useState<number | null>(4);
    const [layers, setLayers] = useState([
        { id: 1, name: 'Navbar Component', type: 'frame', locked: false, x: 0, y: 0, w: 600, h: 60, color: '#0066FF' },
        { id: 2, name: 'Hero Background', type: 'image', locked: true, x: 0, y: 60, w: 600, h: 200, color: '#F0F0F0' },
        { id: 3, name: 'Primary Button', type: 'shape', locked: false, x: 40, y: 300, w: 140, h: 40, color: '#FF0000' },
        { id: 4, name: 'Heading Text', type: 'text', locked: false, x: 40, y: 100, w: 300, h: 40, color: '#333333' }
    ]);

    const tools = [
        { id: 'select', icon: <FiMousePointer />, name: 'Select' },
        { id: 'move', icon: <FiMove />, name: 'Pan' },
        { id: 'rectangle', icon: <FiSquare />, name: 'Rectangle' },
        { id: 'circle', icon: <FiCircleIcon />, name: 'Ellipse' },
        { id: 'text', icon: <FiType />, name: 'Text' },
        { id: 'pen', icon: <FiEdit2 />, name: 'Pen' }
    ];

    const selectedLayer = layers.find(l => l.id === selectedId);

    const updateLayer = (id: number, updates: any) => {
        setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const addLayer = () => {
        const newId = Math.max(...layers.map(l => l.id)) + 1;
        setLayers([...layers, {
            id: newId,
            name: `New Layer ${newId}`,
            type: 'shape',
            locked: false,
            x: 100,
            y: 100,
            w: 100,
            h: 100,
            color: '#0066FF'
        }]);
        setSelectedId(newId);
    };

    return (
        <WorkspaceLayout title="Visual Asset Canvas" role="GRAPHIC DESIGNER" color="#FF0000">
            <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid #333' }}>

                {/* Left Toolbar */}
                <div style={{ width: '64px', backgroundColor: '#141418', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: '20px' }}>
                    {tools.map(tool => (
                        <div
                            key={tool.id}
                            title={tool.name}
                            onClick={() => setActiveTool(tool.id)}
                            style={{
                                width: '42px', height: '42px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: activeTool === tool.id ? 'var(--primary-red)' : 'transparent',
                                color: activeTool === tool.id ? '#FFF' : '#777',
                                cursor: 'pointer', transition: 'all 0.3s', fontSize: '20px'
                            }}
                        >
                            {tool.icon}
                        </div>
                    ))}
                </div>

                {/* Main Canvas Area */}
                <div style={{
                    flex: 1, backgroundColor: '#0D0D11',
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '30px 30px', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 25, left: 25, backgroundColor: 'rgba(20,20,24,0.9)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '30px', display: 'flex', gap: '25px', border: '1px solid #333', color: '#888', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', zIndex: 10 }}>
                        <span>ZOOM: 100%</span>
                        <span>GRID: ACTIVE</span>
                        <span style={{ color: 'var(--primary-red)' }}>LAYER: {selectedLayer?.name.toUpperCase() || 'NONE'}</span>
                    </div>

                    {/* Functional Canvas Elements */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '600px',
                        height: '450px',
                        backgroundColor: '#FFF',
                        borderRadius: '4px',
                        boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
                        overflow: 'hidden'
                    }}>
                        {layers.map(layer => (
                            <motion.div
                                key={layer.id}
                                layoutId={`layer-${layer.id}`}
                                onClick={(e) => { e.stopPropagation(); setSelectedId(layer.id); }}
                                style={{
                                    position: 'absolute',
                                    left: layer.x,
                                    top: layer.y,
                                    width: layer.w,
                                    height: layer.h,
                                    backgroundColor: layer.type === 'text' || layer.type === 'image' ? 'transparent' : layer.color,
                                    border: selectedId === layer.id ? '2px solid var(--primary-red)' : 'none',
                                    zIndex: layer.id,
                                    cursor: 'move',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: layer.type === 'text' ? layer.color : 'white',
                                    fontWeight: layer.type === 'text' ? 800 : 400
                                }}
                            >
                                {layer.type === 'text' && "Sample Brand Text"}
                                {layer.type === 'image' && <div style={{ width: '100%', height: '100%', backgroundColor: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}><FiImage size={40} /></div>}

                                {selectedId === layer.id && (
                                    <>
                                        <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '10px', height: '10px', backgroundColor: '#FFF', border: '1px solid var(--primary-red)' }}></div>
                                        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '10px', height: '10px', backgroundColor: '#FFF', border: '1px solid var(--primary-red)' }}></div>
                                        <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '10px', height: '10px', backgroundColor: '#FFF', border: '1px solid var(--primary-red)' }}></div>
                                        <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '10px', height: '10px', backgroundColor: '#FFF', border: '1px solid var(--primary-red)' }}></div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Properties Panel */}
                <div style={{ width: '300px', backgroundColor: '#1A1A20', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #333', fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: '#888' }}>PROPERTIES_PANEL</div>

                    {selectedLayer ? (
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ fontSize: '10px', color: '#555', fontWeight: 800, marginBottom: '10px', display: 'block' }}>POSITION & SIZE</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '11px', color: '#888' }}>X</span>
                                        <input type="number" value={selectedLayer.x} onChange={(e) => updateLayer(selectedId!, { x: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: '#0D0D11', border: '1px solid #333', color: '#FFF', padding: '8px', borderRadius: '4px', fontSize: '13px' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '11px', color: '#888' }}>Y</span>
                                        <input type="number" value={selectedLayer.y} onChange={(e) => updateLayer(selectedId!, { y: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: '#0D0D11', border: '1px solid #333', color: '#FFF', padding: '8px', borderRadius: '4px', fontSize: '13px' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '11px', color: '#888' }}>W</span>
                                        <input type="number" value={selectedLayer.w} onChange={(e) => updateLayer(selectedId!, { w: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: '#0D0D11', border: '1px solid #333', color: '#FFF', padding: '8px', borderRadius: '4px', fontSize: '13px' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '11px', color: '#888' }}>H</span>
                                        <input type="number" value={selectedLayer.h} onChange={(e) => updateLayer(selectedId!, { h: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: '#0D0D11', border: '1px solid #333', color: '#FFF', padding: '8px', borderRadius: '4px', fontSize: '13px' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ fontSize: '10px', color: '#555', fontWeight: 800, marginBottom: '10px', display: 'block' }}>FILL COLOR</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input type="color" value={selectedLayer.color} onChange={(e) => updateLayer(selectedId!, { color: e.target.value })} style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
                                    <input type="text" value={selectedLayer.color.toUpperCase()} readOnly style={{ flex: 1, background: '#0D0D11', border: '1px solid #333', color: '#FFF', padding: '8px', borderRadius: '4px', fontSize: '13px' }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#555', fontSize: '12px' }}>Select a layer to view and edit its properties.</div>
                    )}

                    <div style={{ padding: '15px 20px', borderTop: '1px solid #333', borderBottom: '1px solid #333', fontSize: '12px', fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '2px', color: '#888' }}>
                        LAYERS <FiPlus onClick={addLayer} style={{ cursor: 'pointer', color: 'var(--primary-red)' }} />
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {layers.sort((a, b) => b.id - a.id).map(layer => (
                            <div
                                key={layer.id}
                                onClick={() => setSelectedId(layer.id)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    backgroundColor: selectedId === layer.id ? 'rgba(255,0,0,0.1)' : 'transparent',
                                    border: selectedId === layer.id ? '1px solid rgba(255,0,0,0.2)' : '1px solid transparent',
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
                                    <span style={{ color: selectedId === layer.id ? 'var(--primary-red)' : '#555' }}>
                                        {layer.type === 'text' ? <FiType /> : layer.type === 'image' ? <FiImage /> : <FiSquare />}
                                    </span>
                                    <span style={{ color: selectedId === layer.id ? '#FFF' : '#777', fontWeight: selectedId === layer.id ? 700 : 400 }}>{layer.name}</span>
                                </div>
                                <span style={{ opacity: 0.5, color: '#555' }}>{layer.locked ? <FiLock size={12} /> : <FiEye size={12} />}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </WorkspaceLayout>
    );
};

export default DesignerWorkspace;
