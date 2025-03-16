import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardCard.css';

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeDirection = 'up', 
  color = 'primary',
  linkTo,
  linkText = 'View Details'
}) => {
  return (
    <div className={`dashboard-card card-${color}`}>
      <div className="card-content">
        <div className="card-header">
          <div className="card-title">{title}</div>
          {icon && <div className="card-icon"><i className={`fas fa-${icon}`}></i></div>}
        </div>
        
        <div className="card-value">{value}</div>
        
        {change && (
          <div className={`card-change ${changeDirection === 'up' ? 'positive' : 'negative'}`}>
            <i className={`fas fa-arrow-${changeDirection}`}></i>
            <span>{change}%</span>
          </div>
        )}
      </div>
      
      {linkTo && (
        <div className="card-footer">
          <Link to={linkTo} className="card-link">
            {linkText}
            <i className="fas fa-chevron-right"></i>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
