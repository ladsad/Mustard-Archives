import React from 'react';

const SessionMetrics = ({ data }) => {
    if (!data) {
        return <div className="analytics-card">No session data available</div>;
    }

    const metrics = [
        {
            label: 'Total Sessions',
            value: data.total_sessions?.toLocaleString() || '0',
            icon: '📊'
        },
        {
            label: 'Total Events',
            value: data.total_events?.toLocaleString() || '0',
            icon: '📈'
        },
        {
            label: 'Avg Duration',
            value: `${Math.round(data.avg_session_duration || 0)}s`,
            icon: '⏱'
        },
        {
            label: 'Avg Revenue',
            value: `$${(data.avg_revenue_per_session || 0).toFixed(2)}`,
            icon: '💰',
            highlight: true
        },
        {
            label: 'Conversion Rate',
            value: `${data.conversion_rate || 0}%`,
            icon: '🎯',
            highlight: true
        }
    ];

    return (
        <div className="analytics-card">
            <h2>Session Metrics</h2>
            <p style={{ color: '#8b949e', marginBottom: '20px' }}>
                Overview of user session activity
            </p>

            <div className="metrics-grid">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className={`metric-card ${metric.highlight ? 'highlight' : ''}`}
                    >
                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                            {metric.icon}
                        </div>
                        <div className="metric-value">{metric.value}</div>
                        <div className="metric-label">{metric.label}</div>
                    </div>
                ))}
            </div>

            {data.metrics && (
                <div style={{ marginTop: '24px' }}>
                    <h3 style={{
                        color: '#8b949e',
                        fontSize: '0.9rem',
                        marginBottom: '12px'
                    }}>
                        Event Distribution
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px'
                    }}>
                        {Object.entries(data.metrics).map(([key, value]) => (
                            <div key={key} style={{
                                background: '#21262d',
                                padding: '12px',
                                borderRadius: '6px',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#c9d1d9'
                                }}>
                                    {(value / 1000000).toFixed(1)}M
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#8b949e',
                                    textTransform: 'capitalize'
                                }}>
                                    {key.replace('_', ' ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionMetrics;
