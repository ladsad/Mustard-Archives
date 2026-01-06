import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ServiceDetails.css';
import Header from './Header';

function ServiceDetails() {
  const [consultants, setConsultants] = useState([]);
  const [filteredConsultants, setFilteredConsultants] = useState([]);
  const [city, setCity] = useState('');
  const [rate, setRate] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { serviceName } = useParams();
  const navigate = useNavigate();

  const selectConsultant = (consultant) => {
    navigate(`/consultant-details/${consultant.id}`);
  };

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/consultants')
      .then(response => response.json())
      .then(data => {
        const consultantsForService = data.filter(consultant => consultant.service === serviceName);
        setConsultants(consultantsForService);
        setFilteredConsultants(consultantsForService);

        const uniqueCities = [...new Set(consultantsForService.map(consultant => consultant.city))];
        setCities(uniqueCities);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [serviceName]);

  useEffect(() => {
    let filtered = consultants;
    if (city) {
      filtered = filtered.filter(consultant => consultant.city === city);
    }
    if (rate) {
      filtered = filtered.filter(consultant => consultant.rate <= rate);
    }
    setFilteredConsultants(filtered);
  }, [city, rate, consultants]);

  const minRate = Math.min(...consultants.map(consultant => consultant.rate)) || 0;
  const maxRate = Math.max(...consultants.map(consultant => consultant.rate)) || 1000;

  return (
    <>
      <Header />

      <div className="service-details-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Directory
            </button>
            <h1 className="page-title">{serviceName}</h1>
            <p className="page-subtitle">
              Find qualified {serviceName.toLowerCase()} professionals in your area
            </p>
          </div>
        </div>

        <div className="container">
          <div className="service-content">
            {/* Filters Sidebar */}
            <aside className="filters-sidebar">
              <div className="filter-card">
                <h3 className="filter-title">
                  <span className="filter-icon">🔍</span>
                  Filter Results
                </h3>

                <div className="filter-group">
                  <label className="filter-label">Location</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Cities</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    Max Rate: <span className="rate-value">${rate || maxRate}/hr</span>
                  </label>
                  <input
                    type="range"
                    min={minRate}
                    max={maxRate}
                    value={rate || maxRate}
                    onChange={e => setRate(e.target.value)}
                    className="filter-range"
                  />
                  <div className="range-labels">
                    <span>${minRate}</span>
                    <span>${maxRate}</span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary filter-reset"
                  onClick={() => { setCity(''); setRate(''); }}
                >
                  Reset Filters
                </button>
              </div>

              <div className="results-count">
                Showing <strong>{filteredConsultants.length}</strong> of {consultants.length} consultants
              </div>
            </aside>

            {/* Consultants List */}
            <main className="consultants-list">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading consultants...</p>
                </div>
              ) : filteredConsultants.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">👤</span>
                  <h3>No consultants found</h3>
                  <p>Try adjusting your filters</p>
                </div>
              ) : (
                filteredConsultants.map((consultant, index) => (
                  <div
                    className="consultant-card"
                    key={consultant.id}
                    onClick={() => selectConsultant(consultant)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="consultant-avatar">
                      {consultant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="consultant-info">
                      <h3 className="consultant-name">{consultant.name}</h3>
                      <div className="consultant-meta">
                        <span className="meta-item">
                          <span className="meta-icon">📍</span>
                          {consultant.city}
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">💼</span>
                          {consultant.service}
                        </span>
                      </div>
                      <div className="consultant-contact">
                        <span>{consultant.email}</span>
                        <span>{consultant.phone}</span>
                      </div>
                    </div>
                    <div className="consultant-rate">
                      <span className="rate-amount">${consultant.rate}</span>
                      <span className="rate-label">/hour</span>
                    </div>
                    <div className="consultant-action">
                      <span className="action-arrow">→</span>
                    </div>
                  </div>
                ))
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServiceDetails;