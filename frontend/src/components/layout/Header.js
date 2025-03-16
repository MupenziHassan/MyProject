import React, { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="main-header">
      <div className="navbar-top">
        <div className="top-container">
          <div className="contact-info">
            <a href="tel:+250789123456">
              <i className="fas fa-phone-alt"></i> +250 789 123 456
            </a>
            <a href="mailto:info@healthprediction.rw">
              <i className="fas fa-envelope"></i> info@healthprediction.rw
            </a>
          </div>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>
      
      <div className="header-container">
        <div className="logo">
          <img src="/logo.png" alt="Health Prediction System" />
          <div className="logo-text">
            <h1>Health Prediction</h1>
            <span>Cancer Risk Assessment</span>
          </div>
        </div>
        
        <nav className="navbar-main">
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/about">About Us</NavLink></li>
            <li><NavLink to="/services">Services</NavLink></li>
            {currentUser ? (
              <>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                <li><Link to="#" onClick={logout}>Logout</Link></li>
              </>
            ) : (
              <>
                <li><NavLink to="/login">Login</NavLink></li>
                <li><NavLink to="/register">Register</NavLink></li>
              </>
            )}
          </ul>
        </nav>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav>
            <ul>
              <li><NavLink to="/" onClick={toggleMobileMenu}>Home</NavLink></li>
              <li><NavLink to="/about" onClick={toggleMobileMenu}>About Us</NavLink></li>
              <li><NavLink to="/services" onClick={toggleMobileMenu}>Services</NavLink></li>
              {currentUser ? (
                <>
                  <li><NavLink to="/dashboard" onClick={toggleMobileMenu}>Dashboard</NavLink></li>
                  <li><Link to="#" onClick={() => { logout(); toggleMobileMenu(); }}>Logout</Link></li>
                </>
              ) : (
                <>
                  <li><NavLink to="/login" onClick={toggleMobileMenu}>Login</NavLink></li>
                  <li><NavLink to="/register" onClick={toggleMobileMenu}>Register</NavLink></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
