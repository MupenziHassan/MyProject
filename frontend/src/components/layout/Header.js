import React, { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close user menu if it's open
    if (userMenuOpen) setUserMenuOpen(false);
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Get appropriate dashboard link based on user role
  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'admin': return '/admin/dashboard';
      case 'doctor': return '/doctor/dashboard';
      case 'patient': return '/patient/dashboard';
      default: return '/dashboard';
    }
  };

  // Get personalized quick links based on user role
  const getPersonalizedLinks = () => {
    if (!currentUser) return [];
    
    switch (currentUser.role) {
      case 'patient':
        return [
          { path: '/patient/health-metrics', icon: 'chart-line', label: 'Health Metrics' },
          { path: '/patient/medications', icon: 'pills', label: 'Medications' },
          { path: '/patient/predictions', icon: 'chart-pie', label: 'Risk Assessments' },
          { path: '/patient/profile', icon: 'user-circle', label: 'My Profile' }
        ];
      case 'doctor':
        return [
          { path: '/doctor/patients', icon: 'users', label: 'My Patients' },
          { path: '/doctor/appointments', icon: 'calendar-alt', label: 'Schedule' },
          { path: '/doctor/messages', icon: 'envelope', label: 'Messages' },
          { path: '/doctor/profile', icon: 'user-md', label: 'My Profile' }
        ];
      case 'admin':
        return [
          { path: '/admin/users', icon: 'user-cog', label: 'User Management' },
          { path: '/admin/settings', icon: 'cogs', label: 'System Settings' },
          { path: '/admin/analytics', icon: 'chart-bar', label: 'Analytics' },
          { path: '/admin/logs', icon: 'clipboard-list', label: 'System Logs' }
        ];
      default:
        return [];
    }
  };

  const personalizedLinks = getPersonalizedLinks();

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-text">
            <h1>Health Prediction</h1>
            <span>Cancer Risk Assessment</span>
          </div>
        </div>
        
        <nav className="navbar-main">
          <ul className="main-nav-list">
            <li><NavLink to={getDashboardLink()}>Dashboard</NavLink></li>
            
            {currentUser && (
              <>
                {/* Main navigation links based on role */}
                {currentUser.role === 'patient' && (
                  <>
                    <li><NavLink to="/patient/predictions">My Predictions</NavLink></li>
                    <li><NavLink to="/patient/appointments">Appointments</NavLink></li>
                  </>
                )}
                {currentUser.role === 'doctor' && (
                  <>
                    <li><NavLink to="/doctor/patients">Patients</NavLink></li>
                    <li><NavLink to="/doctor/appointments">Appointments</NavLink></li>
                  </>
                )}
                {currentUser.role === 'admin' && (
                  <li><NavLink to="/admin/settings">System Settings</NavLink></li>
                )}
              </>
            )}
          </ul>
        </nav>
        
        <div className="header-actions">
          {currentUser ? (
            <>
              {/* Personalized Quick Links Button */}
              <div className="quick-links-dropdown">
                <button className="quick-links-button" onClick={toggleUserMenu}>
                  <i className="fas fa-th"></i>
                  <span>Quick Access</span>
                </button>
                
                {userMenuOpen && (
                  <div className="quick-links-menu">
                    <div className="quick-links-header">
                      <span>Quick Links</span>
                    </div>
                    <ul className="quick-links-list">
                      {personalizedLinks.map((link, index) => (
                        <li key={index}>
                          <Link to={link.path} onClick={() => setUserMenuOpen(false)}>
                            <i className={`fas fa-${link.icon}`}></i>
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* User Profile and Logout */}
              <div className="user-menu-container">
                <div className="user-info">
                  <span className="user-role">{currentUser.role}</span>
                  <span className="user-name">{currentUser.name}</span>
                </div>
                <Link to="#" onClick={logout} className="logout-button">
                  <i className="fas fa-sign-out-alt"></i>
                </Link>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav>
            <ul>
              <li><NavLink to={getDashboardLink()} onClick={toggleMobileMenu}>Dashboard</NavLink></li>
              {currentUser ? (
                <>
                  {/* Mobile personalized quick links */}
                  <li className="mobile-quick-links-title">Quick Access</li>
                  {personalizedLinks.map((link, index) => (
                    <li key={index}>
                      <NavLink to={link.path} onClick={toggleMobileMenu}>
                        <i className={`fas fa-${link.icon}`}></i>
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                  
                  {/* Mobile main navigation */}
                  <li className="mobile-nav-title">Main Navigation</li>
                  {currentUser.role === 'patient' && (
                    <>
                      <li><NavLink to="/patient/predictions" onClick={toggleMobileMenu}>My Predictions</NavLink></li>
                      <li><NavLink to="/patient/appointments" onClick={toggleMobileMenu}>Appointments</NavLink></li>
                    </>
                  )}
                  {currentUser.role === 'doctor' && (
                    <>
                      <li><NavLink to="/doctor/patients" onClick={toggleMobileMenu}>Patients</NavLink></li>
                      <li><NavLink to="/doctor/appointments" onClick={toggleMobileMenu}>Appointments</NavLink></li>
                    </>
                  )}
                  {currentUser.role === 'admin' && (
                    <li><NavLink to="/admin/settings" onClick={toggleMobileMenu}>System Settings</NavLink></li>
                  )}
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
