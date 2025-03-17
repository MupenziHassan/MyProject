import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PatientSidebar from '../components/patient/PatientSidebar';
import Header from '../components/common/Header';
import '../styles/Layout.css';

const PatientLayout = () => {
  const location = useLocation();
  
  // Get current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/health-dashboard')) return 'Health Dashboard';
    if (path.includes('/health-data/submit')) return 'Submit Health Data';
    if (path.includes('/appointments/schedule')) return 'Schedule Appointment';
    if (path.includes('/appointments')) return 'Appointments';
    return 'Patient Portal';
  };
  
  return (
    <div className="layout-container">
      <PatientSidebar />
      <div className="content-wrapper">
        <Header pageTitle={getPageTitle()} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
