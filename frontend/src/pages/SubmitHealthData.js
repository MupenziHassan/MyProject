import React from 'react';
import HealthInformationForm from '../components/patient/HealthInformationForm';
import '../styles/forms.css';

const SubmitHealthData = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Submit Health Information</h1>
        <p>
          Please provide accurate health information to help your healthcare 
          provider make informed decisions about your care. Your data is secure 
          and will only be accessible by your healthcare team.
        </p>
      </div>
      
      <div className="page-content">
        <div className="info-panel">
          <div className="info-item">
            <div className="info-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="info-text">
              <h3>Your Privacy Matters</h3>
              <p>All your health information is encrypted and protected</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <i className="fas fa-stethoscope"></i>
            </div>
            <div className="info-text">
              <h3>Better Care</h3>
              <p>Accurate information leads to better healthcare decisions</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="info-text">
              <h3>Track Progress</h3>
              <p>Regular updates help monitor your health over time</p>
            </div>
          </div>
        </div>
        
        <HealthInformationForm />
      </div>
    </div>
  );
};

export default SubmitHealthData;
