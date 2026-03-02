import React, { useEffect, useState } from 'react';

type Status = 'unknown' | 'live' | 'down';

const HealthBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const [status, setStatus] = useState<Status>('unknown');
    const [latency, setLatency] = useState<number | null>(null);

    const checkHealth = async () => {
        try {
            const start = performance.now();
            const res = await fetch('/api/health', { cache: 'no-store' });
            const elapsed = performance.now() - start;
            setLatency(Math.round(elapsed));
            setStatus(res.ok ? 'live' : 'down');
        } catch {
            setStatus('down');
            setLatency(null);
        }
    };

    useEffect(() => {
        checkHealth();
        const id = setInterval(checkHealth, 5000);
        return () => clearInterval(id);
    }, []);

    const color =
        status === 'live' ? '#00FF66' :
        status === 'down' ? '#FF3333' :
        '#FFCC00';

    return (
        <div
            title={status === 'live' ? 'Function healthy' : status === 'down' ? 'Function unreachable' : 'Checking...'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: compact ? 6 : 10,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6,
                padding: compact ? '6px 8px' : '8px 12px',
                fontSize: compact ? 10 : 11,
                letterSpacing: 1,
                color: '#BBB'
            }}
        >
            <span
                style={{
                    width: compact ? 8 : 10,
                    height: compact ? 8 : 10,
                    borderRadius: '50%',
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}66`
                }}
            />
            <span>
                {status === 'live' ? 'LIVE' : status === 'down' ? 'DOWN' : 'CHECKING'}
                {latency !== null ? ` • ${latency}ms` : ''}
            </span>
        </div>
    );
};

export default HealthBadge;
