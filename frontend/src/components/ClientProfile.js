import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ClientProfile.css';
import Header from './Header';

function ClientProfile() {
  const [selectedSection, setSelectedSection] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    home: '',
    city: ''
  });
  const [projects, setProjects] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clientId } = useParams();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientRes, projectsRes, consultantsRes, paymentsRes] = await Promise.all([
        fetch(`http://localhost:3001/api/clients/${clientId}`),
        fetch(`http://localhost:3001/api/projects/clients/${clientId}`),
        fetch('http://localhost:3001/api/consultants'),
        fetch(`http://localhost:3001/api/payments/clients/${clientId}`)
      ]);

      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setProfileData(clientData || {});
      }
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(Array.isArray(projectsData) ? projectsData : projectsData ? [projectsData] : []);
      }
      if (consultantsRes.ok) {
        const consultantsData = await consultantsRes.json();
        setConsultants(consultantsData || []);
      }
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData ? [paymentsData] : []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sections = [
    { id: 'profile', label: 'Profile Info', icon: '👤' },
    { id: 'status', label: 'Projects', icon: '📋' },
    { id: 'payments', label: 'Payments', icon: '💳' }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Directory
            </button>
            <div className="profile-header-content">
              <div className="profile-avatar">
                {profileData.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="profile-header-info">
                <h1>{profileData.name || 'Client'}</h1>
                <p>{profileData.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="profile-layout">
            {/* Sidebar Navigation */}
            <aside className="profile-sidebar">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`sidebar-btn ${selectedSection === section.id ? 'active' : ''}`}
                  onClick={() => setSelectedSection(section.id)}
                >
                  <span className="sidebar-icon">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </aside>

            {/* Content Area */}
            <main className="profile-content">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading...</p>
                </div>
              ) : (
                <>
                  {selectedSection === 'profile' && (
                    <div className="content-section">
                      <h2 className="section-title">Profile Information</h2>
                      <div className="info-grid">
                        <div className="info-card">
                          <span className="info-label">Full Name</span>
                          <span className="info-value">{profileData.name || 'N/A'}</span>
                        </div>
                        <div className="info-card">
                          <span className="info-label">Email Address</span>
                          <span className="info-value">{profileData.email || 'N/A'}</span>
                        </div>
                        <div className="info-card">
                          <span className="info-label">Phone Number</span>
                          <span className="info-value">{profileData.phone || 'N/A'}</span>
                        </div>
                        <div className="info-card">
                          <span className="info-label">Address</span>
                          <span className="info-value">{profileData.home || 'N/A'}</span>
                        </div>
                        <div className="info-card">
                          <span className="info-label">City</span>
                          <span className="info-value">{profileData.city || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSection === 'status' && (
                    <div className="content-section">
                      <h2 className="section-title">Your Projects</h2>
                      {projects.length === 0 ? (
                        <div className="empty-state">
                          <span className="empty-icon">📋</span>
                          <h3>No projects yet</h3>
                          <p>Start a project with one of our consultants</p>
                        </div>
                      ) : (
                        <div className="projects-list">
                          {projects.map((project, index) => {
                            const consultant = consultants.find(c => c.id === project.consultant_id);
                            return (
                              <div key={index} className="project-card">
                                <div className="project-header">
                                  <h3>{project.name}</h3>
                                  <span className={`status-badge ${getStatusColor(project.status)}`}>
                                    {project.status}
                                  </span>
                                </div>
                                {consultant && (
                                  <p className="project-consultant">
                                    <span className="meta-icon">👤</span>
                                    Consultant: {consultant.name}
                                  </p>
                                )}
                                <div className="project-dates">
                                  <span>📅 {new Date(project.s_date).toLocaleDateString()} - {new Date(project.e_date).toLocaleDateString()}</span>
                                </div>
                                <div className="project-cost">
                                  <span className="cost-label">Total Cost</span>
                                  <span className="cost-value">${project.tot_cost}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSection === 'payments' && (
                    <div className="content-section">
                      <h2 className="section-title">Payment History</h2>
                      {payments.length === 0 ? (
                        <div className="empty-state">
                          <span className="empty-icon">💳</span>
                          <h3>No payments yet</h3>
                          <p>Your payment history will appear here</p>
                        </div>
                      ) : (
                        <div className="payments-list">
                          {payments.map((payment, index) => (
                            <div key={index} className="payment-card">
                              <div className="payment-info">
                                <span className="payment-date">{payment.date}</span>
                                <span className="payment-method">{payment.method}</span>
                              </div>
                              <span className="payment-amount">${payment.amount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClientProfile;