import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import DoctorProfile from '../components/doctor/DoctorProfile';
import DoctorVerification from '../components/doctor/DoctorVerification';
import PatientManagement from '../components/doctor/PatientManagement';
import AppointmentManagement from '../components/doctor/AppointmentManagement';
import TestManagement from '../components/doctor/TestManagement';

const DoctorDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect if not a doctor
  if (currentUser.role !== 'doctor') {
    return <Navigate to="/unauthorized" />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <DoctorProfile />;
      case 'verification':
        return <DoctorVerification />;
      case 'patients':
        return <PatientManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'tests':
        return <TestManagement />;
      default:
        return <DoctorProfile />;
    }
  };

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, Dr. {currentUser.name}</p>
      </div>

      <div className="dashboard-nav">
        <ul className="tab-menu">
          <li className={activeTab === 'profile' ? 'active' : ''}>
            <button onClick={() => setActiveTab('profile')}>
              Profile
            </button>
          </li>
          <li className={activeTab === 'verification' ? 'active' : ''}>
            <button onClick={() => setActiveTab('verification')}>
              Verification
            </button>
          </li>
          <li className={activeTab === 'patients' ? 'active' : ''}>
            <button onClick={() => setActiveTab('patients')}>
              Patients
            </button>
          </li>
          <li className={activeTab === 'appointments' ? 'active' : ''}>
            <button onClick={() => setActiveTab('appointments')}>
              Appointments
            </button>
          </li>
          <li className={activeTab === 'tests' ? 'active' : ''}>
            <button onClick={() => setActiveTab('tests')}>
              Tests & Predictions
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

export default DoctorDashboard;
