import React, { useState, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import PatientProfile from '../components/patient/PatientProfile';
import MedicalHistoryForm from '../components/patient/MedicalHistoryForm';
import LifestyleForm from '../components/patient/LifestyleForm';
import TestResults from '../components/patient/TestResults';
import Predictions from '../components/patient/Predictions';

const PatientDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect if not a patient
  if (currentUser.role !== 'patient') {
    return <Navigate to="/unauthorized" />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <PatientProfile />;
      case 'medical-history':
        return <MedicalHistoryForm />;
      case 'lifestyle':
        return <LifestyleForm />;
      case 'test-results':
        return <TestResults />;
      case 'predictions':
        return <Predictions />;
      default:
        return <PatientProfile />;
    }
  };

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <p>Welcome, {currentUser.name}</p>
      </div>

      <div className="dashboard-nav">
        <ul className="tab-menu">
          <li className={activeTab === 'profile' ? 'active' : ''}>
            <button onClick={() => setActiveTab('profile')}>
              Profile
            </button>
          </li>
          <li className={activeTab === 'medical-history' ? 'active' : ''}>
            <button onClick={() => setActiveTab('medical-history')}>
              Medical History
            </button>
          </li>
          <li className={activeTab === 'lifestyle' ? 'active' : ''}>
            <button onClick={() => setActiveTab('lifestyle')}>
              Lifestyle
            </button>
          </li>
          <li className={activeTab === 'test-results' ? 'active' : ''}>
            <button onClick={() => setActiveTab('test-results')}>
              Test Results
            </button>
          </li>
          <li className={activeTab === 'predictions' ? 'active' : ''}>
            <button onClick={() => setActiveTab('predictions')}>
              Predictions
            </button>
          </li>
        </ul>
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PatientDashboard;
