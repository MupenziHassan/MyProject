import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppointmentList from '../components/patient/AppointmentList';
import '../styles/AppointmentList.css';

const PatientAppointments = () => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.message || 'Operation completed successfully');
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>
          View and manage your scheduled appointments with healthcare providers.
        </p>
      </div>
      
      {successMessage && (
        <div className="success-message global-message">
          <i className="fas fa-check-circle"></i>
          {successMessage}
          <button className="close-message" onClick={() => setSuccessMessage('')}>
            &times;
          </button>
        </div>
      )}
      
      <div className="page-content">
        <AppointmentList />
      </div>
    </div>
  );
};

export default PatientAppointments;
