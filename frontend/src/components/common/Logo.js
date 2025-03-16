import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ variant = 'default', showTagline = true }) => {
  return (
    <div className={`logo-container logo-${variant}`}>
      <Link to="/" className="logo-link">
        <div className="logo-icon">
          <div className="logo-symbol">
            <i className="fas fa-heartbeat"></i>
          </div>
        </div>
        <div className="logo-text">
          <h1>Health<span>Prediction</span></h1>
          {showTagline && <p className="logo-tagline">Cancer Risk Assessment</p>}
        </div>
      </Link>
    </div>
  );
};

export default Logo;
