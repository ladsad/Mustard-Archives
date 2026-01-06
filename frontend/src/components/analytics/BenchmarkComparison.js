import React from 'react';

const BenchmarkComparison = ({ data, compact = false }) => {
    if (!data) {
        return <div className="analytics-card">No benchmark data available</div>;
    }

    const { pandas, spark, speedup, row_count, has_data } = data;

    const benchmarks = [
        { label: 'Sessionization', pandas: pandas.sessionization, spark: spark.sessionization, speedup: speedup.sessionization },
        { label: 'Funnel', pandas: pandas.funnel, spark: spark.funnel, speedup: speedup.funnel },
        { label: 'Cohort', pandas: pandas.cohort, spark: spark.cohort, speedup: speedup.cohort }
    ];

    const maxTime = Math.max(pandas.total, spark.total);

    return (
        <div className={`analytics-card ${compact ? 'compact' : ''}`}>
            <h2>Pandas vs PySpark</h2>
            {!compact && (
                <p style={{ color: '#8b949e', marginBottom: '16px' }}>
                    Performance comparison on {(row_count / 1000000).toFixed(0)}M rows
                    {!has_data && ' (demo data)'}
                </p>
            )}

            <div className="benchmark-container">
                {/* Header Row */}
                {!compact && (
                    <div className="benchmark-row" style={{ marginBottom: '8px' }}>
                        <div className="benchmark-label" style={{ fontWeight: '600' }}>Task</div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#f85149'
                        }}>
                            <span style={{
                                width: '12px',
                                height: '12px',
                                background: '#f85149',
                                borderRadius: '3px'
                            }}></span>
                            Pandas
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#3fb950'
                        }}>
                            <span style={{
                                width: '12px',
                                height: '12px',
                                background: '#3fb950',
                                borderRadius: '3px'
                            }}></span>
                            Spark
                        </div>
                        <div style={{ color: '#8b949e', textAlign: 'center' }}>Speedup</div>
                    </div>
                )}

                {/* Benchmark Rows */}
                {benchmarks.map((benchmark, index) => (
                    <div key={index} className="benchmark-row">
                        <div className="benchmark-label">{benchmark.label}</div>
                        <div style={{ position: 'relative' }}>
                            <div
                                className="benchmark-bar pandas"
                                style={{ width: `${(benchmark.pandas / maxTime) * 100}%` }}
                            >
                                {benchmark.pandas.toFixed(1)}s
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div
                                className="benchmark-bar spark"
                                style={{ width: `${(benchmark.spark / maxTime) * 100}%` }}
                            >
                                {benchmark.spark.toFixed(1)}s
                            </div>
                        </div>
                        <div className="speedup-badge">{benchmark.speedup}x</div>
                    </div>
                ))}

                {/* Total Row */}
                <div style={{
                    borderTop: '1px solid #30363d',
                    marginTop: '16px',
                    paddingTop: '16px'
                }}>
                    <div className="benchmark-row">
                        <div className="benchmark-label" style={{ fontWeight: '700' }}>TOTAL</div>
                        <div style={{
                            background: '#21262d',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            color: '#f85149',
                            fontWeight: '600'
                        }}>
                            {pandas.total.toFixed(1)}s
                        </div>
                        <div style={{
                            background: '#0d2818',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            color: '#3fb950',
                            fontWeight: '600'
                        }}>
                            {spark.total.toFixed(1)}s
                        </div>
                        <div className="speedup-badge" style={{
                            background: 'linear-gradient(135deg, #a371f7 0%, #8957e5 100%)',
                            fontSize: '1rem'
                        }}>
                            {speedup.total}x
                        </div>
                    </div>
                </div>

                {/* Summary */}
                {!compact && (
                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        background: '#0d2818',
                        borderRadius: '8px',
                        border: '1px solid #238636',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.25rem', color: '#3fb950', fontWeight: '600' }}>
                            {((1 - spark.total / pandas.total) * 100).toFixed(0)}% Faster
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#8b949e', marginTop: '4px' }}>
                            PySpark reduces total query time by {(pandas.total - spark.total).toFixed(1)} seconds
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BenchmarkComparison;
