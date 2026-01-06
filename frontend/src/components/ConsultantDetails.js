import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ConsultantDetails.css';
import Header from './Header';

function ConsultantDetails() {
  const [consultant, setConsultant] = useState({});
  const [username, setUsername] = useState('');
  const [projectId, setprojectId] = useState('');
  const [projectName, setprojectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hours, setHours] = useState('');
  const [isRequestingProject, setIsRequestingProject] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const { consultantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3001/api/consultants/${consultantId}`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setConsultant(data);
        setLoading(false);
      })
      .catch(error => {
        console.log('Error:', error);
        setLoading(false);
      });
  }, [consultantId]);

  const requestProject = () => {
    if (!username || !projectName || !startDate || !endDate || !hours) {
      setSubmitStatus('Please fill in all fields');
      return;
    }

    fetch(`http://localhost:3001/api/clients/username/${username}`)
      .then(response => {
        if (!response.ok) throw new Error('Client not found');
        return response.json();
      })
      .then(client => {
        return fetch('http://localhost:3001/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: projectId || Date.now(),
            name: projectName,
            client_id: client.id,
            consultant_id: consultantId,
            s_date: startDate,
            e_date: endDate,
            status: 'processing',
            tot_cost: hours * consultant.rate,
          }),
        });
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to create project');
        return response.json();
      })
      .then(() => {
        setSubmitStatus('Project requested successfully!');
        setTimeout(() => navigate('/'), 2000);
      })
      .catch(error => {
        setSubmitStatus(error.message);
      });
  };

  const estimatedCost = hours && consultant.rate ? hours * consultant.rate : 0;

  return (
    <>
      <Header />
      <div className="consultant-page">
        <div className="consultant-hero">
          <div className="container">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </div>

        <div className="container">
          <div className="consultant-layout">
            {/* Profile Card */}
            <aside className="consultant-profile-card">
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <div className="profile-avatar">
                    {consultant.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <h2 className="profile-name">{consultant.name}</h2>
                  <span className="profile-service">{consultant.service}</span>

                  <div className="profile-rate">
                    <span className="rate-amount">${consultant.rate}</span>
                    <span className="rate-label">/hour</span>
                  </div>

                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="detail-icon">📧</span>
                      <span>{consultant.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📞</span>
                      <span>{consultant.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{consultant.city}</span>
                    </div>
                  </div>

                  {!isRequestingProject && (
                    <button
                      className="btn btn-primary request-btn"
                      onClick={() => setIsRequestingProject(true)}
                    >
                      Request Project
                    </button>
                  )}
                </>
              )}
            </aside>

            {/* Request Form */}
            {isRequestingProject && (
              <main className="request-form-card">
                <h3 className="form-title">Request a Project</h3>
                <p className="form-subtitle">Fill in the details to start working with {consultant.name}</p>

                {submitStatus && (
                  <div className={`status-message ${submitStatus.includes('success') ? 'success' : 'error'}`}>
                    {submitStatus}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Your Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={e => setprojectName(e.target.value)}
                      placeholder="E.g., Website Redesign"
                    />
                  </div>

                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estimated Hours</label>
                    <input
                      type="number"
                      value={hours}
                      onChange={e => setHours(e.target.value)}
                      placeholder="0"
                      min={0}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estimated Cost</label>
                    <div className="cost-display">
                      ${estimatedCost.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsRequestingProject(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={requestProject}
                  >
                    Submit Request
                  </button>
                </div>
              </main>
            )}

            {!isRequestingProject && (
              <main className="consultant-info-card">
                <h3>About This Consultant</h3>
                <p>
                  {consultant.name} is a professional {consultant.service?.toLowerCase()} consultant
                  based in {consultant.city}. With competitive rates starting at ${consultant.rate}/hour,
                  they are ready to help with your next project.
                </p>
                <div className="info-highlight">
                  <span className="highlight-icon">💼</span>
                  <span>Click "Request Project" to get started</span>
                </div>
              </main>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ConsultantDetails;