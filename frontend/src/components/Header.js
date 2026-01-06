import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/analytics', label: 'Analytics' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="yp-header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="yp-logo">
                    <div className="logo-icon">
                        <span className="logo-book"></span>
                    </div>
                    <div className="logo-text">
                        <span className="logo-title">Mustard Archives</span>
                        <span className="logo-tagline">Your Business Directory</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="yp-nav desktop-nav">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Auth Buttons */}
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/login')}
                    >
                        List Your Business
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className={`mobile-menu-toggle ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Mobile Navigation */}
            <nav className={`yp-nav mobile-nav ${menuOpen ? 'open' : ''}`}>
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}
                <div className="mobile-auth">
                    <button
                        className="btn btn-primary"
                        onClick={() => { navigate('/login'); setMenuOpen(false); }}
                    >
                        Sign In
                    </button>
                </div>
            </nav>
        </header>
    );
}

export default Header;