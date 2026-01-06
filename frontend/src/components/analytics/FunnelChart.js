import React from 'react';

const FunnelChart = ({ data, compact = false }) => {
    if (!data || !data.stages) {
        return <div className="analytics-card">No funnel data available</div>;
    }

    const { stages, conversion_rate } = data;
    const maxUsers = stages[0]?.user_count || 1;

    return (
        <div className={`analytics-card ${compact ? 'compact' : ''}`}>
            <h2>Funnel Analysis</h2>
            {!compact && (
                <p style={{ color: '#8b949e', marginBottom: '16px' }}>
                    User journey from page view to purchase
                </p>
            )}

            <div className="funnel-container">
                {stages.map((stage, index) => {
                    const percentage = ((stage.user_count / maxUsers) * 100).toFixed(1);
                    const stageClass = stage.stage.replace('_', '_');

                    return (
                        <div key={stage.stage} className="funnel-stage">
                            <span className="funnel-label">
                                {stage.stage.replace('_', ' ')}
                            </span>
                            <div className="funnel-bar-container">
                                <div
                                    className={`funnel-bar stage-${stageClass}`}
                                    style={{ width: `${percentage}%` }}
                                >
                                    {stage.user_count.toLocaleString()}
                                </div>
                            </div>
                            <span className="funnel-percentage">
                                {percentage}%
                            </span>
                        </div>
                    );
                })}
            </div>

            {!compact && (
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: '#21262d',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-around'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3fb950' }}>
                            {conversion_rate}%
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                            Conversion Rate
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f0883e' }}>
                            {(100 - conversion_rate).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                            Drop-off Rate
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FunnelChart;
