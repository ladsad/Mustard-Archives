import React from 'react';

const CohortHeatmap = ({ data }) => {
    if (!data || !data.cohorts) {
        return <div className="analytics-card">No cohort data available</div>;
    }

    const { cohorts, summary } = data;

    // Color interpolation for heatmap
    const getColor = (value, min, max) => {
        const ratio = (value - min) / (max - min);
        // Green gradient: darker green = higher value
        const r = Math.round(16 + (1 - ratio) * 20);
        const g = Math.round(100 + ratio * 85);
        const b = Math.round(16 + (1 - ratio) * 20);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const ltvMin = Math.min(...cohorts.map(c => c.avg_ltv));
    const ltvMax = Math.max(...cohorts.map(c => c.avg_ltv));

    return (
        <div className="analytics-card">
            <h2>Cohort Analysis</h2>
            <p style={{ color: '#8b949e', marginBottom: '24px' }}>
                Monthly user cohorts with average LTV
            </p>

            {/* Summary Cards */}
            <div className="metrics-grid" style={{ marginBottom: '24px' }}>
                <div className="metric-card">
                    <div className="metric-value">{summary.total_cohorts}</div>
                    <div className="metric-label">Total Cohorts</div>
                </div>
                <div className="metric-card">
                    <div className="metric-value">{summary.avg_cohort_size.toLocaleString()}</div>
                    <div className="metric-label">Avg Cohort Size</div>
                </div>
                <div className="metric-card highlight">
                    <div className="metric-value">${summary.avg_ltv.toFixed(0)}</div>
                    <div className="metric-label">Avg LTV</div>
                </div>
            </div>

            {/* Cohort Table */}
            <div className="cohort-heatmap">
                <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '4px'
                }}>
                    <thead>
                        <tr>
                            <th style={{
                                padding: '12px',
                                background: '#21262d',
                                borderRadius: '6px',
                                color: '#8b949e',
                                fontSize: '0.85rem'
                            }}>
                                Month
                            </th>
                            <th style={{
                                padding: '12px',
                                background: '#21262d',
                                borderRadius: '6px',
                                color: '#8b949e',
                                fontSize: '0.85rem'
                            }}>
                                Size
                            </th>
                            <th style={{
                                padding: '12px',
                                background: '#21262d',
                                borderRadius: '6px',
                                color: '#8b949e',
                                fontSize: '0.85rem'
                            }}>
                                Avg LTV
                            </th>
                            <th style={{
                                padding: '12px',
                                background: '#21262d',
                                borderRadius: '6px',
                                color: '#8b949e',
                                fontSize: '0.85rem'
                            }}>
                                Events
                            </th>
                            <th style={{
                                padding: '12px',
                                background: '#21262d',
                                borderRadius: '6px',
                                color: '#8b949e',
                                fontSize: '0.85rem'
                            }}>
                                Retention
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {cohorts.map((cohort, index) => (
                            <tr key={cohort.month}>
                                <td style={{
                                    padding: '12px',
                                    background: '#21262d',
                                    borderRadius: '6px',
                                    color: '#c9d1d9',
                                    fontWeight: '500'
                                }}>
                                    {cohort.month}
                                </td>
                                <td style={{
                                    padding: '12px',
                                    background: '#21262d',
                                    borderRadius: '6px',
                                    color: '#c9d1d9',
                                    textAlign: 'center'
                                }}>
                                    {cohort.cohort_size.toLocaleString()}
                                </td>
                                <td style={{
                                    padding: '12px',
                                    background: getColor(cohort.avg_ltv, ltvMin, ltvMax),
                                    borderRadius: '6px',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    transition: 'transform 0.2s ease'
                                }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    ${cohort.avg_ltv.toFixed(0)}
                                </td>
                                <td style={{
                                    padding: '12px',
                                    background: '#21262d',
                                    borderRadius: '6px',
                                    color: '#c9d1d9',
                                    textAlign: 'center'
                                }}>
                                    {cohort.avg_events.toFixed(1)}
                                </td>
                                <td style={{
                                    padding: '12px',
                                    background: cohort.retention_rate > 50 ? '#0d2818' : '#21262d',
                                    borderRadius: '6px',
                                    color: cohort.retention_rate > 50 ? '#3fb950' : '#8b949e',
                                    fontWeight: '500',
                                    textAlign: 'center'
                                }}>
                                    {cohort.retention_rate}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CohortHeatmap;
