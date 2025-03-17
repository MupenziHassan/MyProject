// A simplified visualization component for patients showing categorized risk
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../utils/IconFallbacks';
import './RiskDisplay.css';

const PatientRiskDisplay = ({ prediction }) => {
  // Get risk level color and icon
  const getRiskDetails = (riskLevel) => {
    switch(riskLevel.toLowerCase()) {
      case 'low':
        return { color: '#27ae60', icon: 'FaCheckCircle', actionLabel: 'Maintain Healthy Habits' };
      case 'moderate':
        return { color: '#f39c12', icon: 'FaExclamationTriangle', actionLabel: 'Consider Follow-up' };
      case 'high':
        return { color: '#c0392b', icon: 'FaExclamationCircle', actionLabel: 'Schedule Appointment' };
      default:
        return { color: '#7f8c8d', icon: 'FaQuestion', actionLabel: 'Review Details' };
    }
  };
  
  const { color, icon, actionLabel } = getRiskDetails(prediction.riskLevel);
  
  return (
    <div className="patient-risk-card">
      <div className="risk-header" style={{ backgroundColor: color }}>
        <Icon name={icon} size={24} color="#fff" />
        <h3>{prediction.conditionName} Risk: {prediction.riskLevel}</h3>
      </div>
      
      <div className="risk-body">
        <div className="risk-factors">
          <h4>Contributing Factors:</h4>
          <ul>
            {prediction.factors.slice(0, 3).map((factor, index) => (
              <li key={index}>{factor.name}</li>
            ))}
          </ul>
        </div>
        
        <div className="risk-action">
          <Link 
            to={`/patient/predictions/${prediction.id}/action`}
            className="btn action-btn"
            style={{ backgroundColor: color }}
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientRiskDisplay;
