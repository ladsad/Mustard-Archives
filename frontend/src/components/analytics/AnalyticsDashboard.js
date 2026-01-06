import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';
import FunnelChart from './FunnelChart';
import CohortHeatmap from './CohortHeatmap';
import SessionMetrics from './SessionMetrics';
import BenchmarkComparison from './BenchmarkComparison';

const API_BASE = 'http://localhost:5000/api/analytics';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    funnel: null,
    cohorts: null,
    sessions: null,
    benchmarks: null
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [funnelRes, cohortsRes, sessionsRes, benchmarksRes] = await Promise.all([
          fetch(`${API_BASE}/funnel`),
          fetch(`${API_BASE}/cohorts`),
          fetch(`${API_BASE}/sessions`),
          fetch(`${API_BASE}/benchmarks`)
        ]);

        setData({
          funnel: await funnelRes.json(),
          cohorts: await cohortsRes.json(),
          sessions: await sessionsRes.json(),
          benchmarks: await benchmarksRes.json()
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'funnel', label: 'Funnel Analysis' },
    { id: 'cohorts', label: 'Cohort Analysis' },
    { id: 'benchmarks', label: 'Performance' }
  ];

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <header className="dashboard-header">
        <h1>PySpark Analytics Dashboard</h1>
        <p className="subtitle">Mustard Archives - Data Pipeline Performance</p>
      </header>

      <nav className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <SessionMetrics data={data.sessions} />
            <div className="overview-charts">
              <FunnelChart data={data.funnel} compact />
              <BenchmarkComparison data={data.benchmarks} compact />
            </div>
          </div>
        )}

        {activeTab === 'funnel' && (
          <FunnelChart data={data.funnel} />
        )}

        {activeTab === 'cohorts' && (
          <CohortHeatmap data={data.cohorts} />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarkComparison data={data.benchmarks} />
        )}
      </main>

      <footer className="dashboard-footer">
        <span>Data: {data.benchmarks?.row_count?.toLocaleString() || '10,000,000'} events</span>
        <span>|</span>
        <span>Powered by PySpark</span>
      </footer>
    </div>
  );
};

export default AnalyticsDashboard;
