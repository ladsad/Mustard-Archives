import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import Header from './Header';

function Home() {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/services')
      .then(response => response.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.descr?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (filteredServices.length === 1) {
      navigate(`/services/${filteredServices[0].name}`);
    }
  };

  // Service category icons (using Unicode for simplicity)
  const categoryIcons = {
    default: '📋',
    consulting: '💼',
    technology: '💻',
    marketing: '📢',
    design: '🎨',
    finance: '💰',
    legal: '⚖️',
    healthcare: '🏥',
  };

  const getIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('tech') || name.includes('software') || name.includes('it')) return categoryIcons.technology;
    if (name.includes('market') || name.includes('advert')) return categoryIcons.marketing;
    if (name.includes('design') || name.includes('creative')) return categoryIcons.design;
    if (name.includes('finance') || name.includes('account')) return categoryIcons.finance;
    if (name.includes('legal') || name.includes('law')) return categoryIcons.legal;
    if (name.includes('health') || name.includes('medical')) return categoryIcons.healthcare;
    if (name.includes('consult')) return categoryIcons.consulting;
    return categoryIcons.default;
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="yp-hero">
        <div className="hero-content">
          <div className="hero-badge">Since 2024</div>
          <h1 className="hero-title">
            Find the <span className="highlight">Right Expert</span> for Your Business
          </h1>
          <p className="hero-subtitle">
            Connect with top consultants and professionals across industries.
            Your trusted directory for quality business services.
          </p>

          {/* Search Box */}
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="What service are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary search-btn">
              Search Directory
            </button>
          </form>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">{services.length}+</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">500+</span>
              <span className="stat-label">Consultants</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">50+</span>
              <span className="stat-label">Cities</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="hero-decoration">
          <div className="deco-book"></div>
        </div>
      </section>

      {/* Services Directory */}
      <section className="yp-directory">
        <div className="container">
          <div className="section-header">
            <h2>Browse Our Directory</h2>
            <p>Explore professional services by category</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading services...</p>
            </div>
          ) : (
            <>
              {searchQuery && (
                <div className="search-results-info">
                  Showing {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''} for "{searchQuery}"
                </div>
              )}

              <div className="services-grid">
                {filteredServices.map((service, index) => (
                  <Link
                    to={`/services/${service.name}`}
                    key={service.name}
                    className="service-card"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="card-icon">{getIcon(service.name)}</div>
                    <div className="card-content">
                      <h3 className="card-title">{service.name}</h3>
                      <p className="card-description">{service.descr}</p>
                      <div className="card-footer">
                        <span className="card-rate">
                          ${service.minrate} - ${service.maxrate}
                        </span>
                        <span className="card-arrow">→</span>
                      </div>
                    </div>
                    <div className="card-stripe"></div>
                  </Link>
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <h3>No services found</h3>
                  <p>Try adjusting your search terms</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="yp-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">📒 Mustard Archives</span>
              <p>Your trusted business directory since 2024</p>
            </div>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/analytics">Analytics</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Mustard Archives. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;