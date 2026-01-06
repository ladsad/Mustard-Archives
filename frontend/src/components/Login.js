import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Header from './Header';

function Login() {
  const [isClient, setIsClient] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (isClient) {
        const response = await fetch(`http://localhost:3001/api/clients/username/${username}`);
        const client = await response.json();
        if (client && client.id) {
          navigate(`/client-profile/${client.id}`);
        } else {
          setError('Client not found. Please check your credentials.');
        }
      } else {
        const response = await fetch(`http://localhost:3001/api/consultants`);
        const consultants = await response.json();
        const consultant = consultants.find(c => c.email.split('@')[0] === username);
        if (consultant) {
          navigate(`/consultant-details/${consultant.id}`);
        } else {
          setError('Consultant not found. Please check your credentials.');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-container">
          {/* Left Panel - Branding */}
          <div className="login-branding">
            <div className="branding-content">
              <div className="brand-icon">📒</div>
              <h2>Welcome to<br />Mustard Archives</h2>
              <p>Your trusted business directory connecting clients with top professionals since 2024.</p>

              <div className="brand-features">
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>500+ Verified Consultants</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>50+ Cities Covered</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>Secure & Trusted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="login-form-panel">
            <div className="form-header">
              <h1>Sign In</h1>
              <p>Access your account dashboard</p>
            </div>

            {/* Account Type Toggle */}
            <div className="account-toggle">
              <button
                className={`toggle-btn ${isClient ? 'active' : ''}`}
                onClick={() => setIsClient(true)}
              >
                <span className="toggle-icon">👤</span>
                Client
              </button>
              <button
                className={`toggle-btn ${!isClient ? 'active' : ''}`}
                onClick={() => setIsClient(false)}
              >
                <span className="toggle-icon">💼</span>
                Consultant
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isClient ? "Enter your username" : "Enter your email prefix"}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="btn btn-primary submit-btn">
                Sign In as {isClient ? 'Client' : 'Consultant'}
              </button>

              <div className="form-footer">
                <a href="#forgot" className="forgot-link">Forgot password?</a>
                <span className="divider">|</span>
                <a href="#register" className="register-link">Create account</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;