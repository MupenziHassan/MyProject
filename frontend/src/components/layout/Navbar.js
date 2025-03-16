import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <i className="fas fa-heartbeat"></i> Health Prediction System
        </Link>
        
        <ul className="navbar-links">
          {currentUser ? (
            <>
              <li>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              </li>
              <li className="user-info">
                <span className="user-role">{currentUser.role}</span>
                <span className="user-name">{currentUser.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
