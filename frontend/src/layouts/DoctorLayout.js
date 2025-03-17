import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import Header from '../components/common/Header';
import '../styles/Layout.css';

const DoctorLayout = () => {
  const location = useLocation();
  
  // Get current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Doctor Dashboard';
    if (path.includes('/patients')) return 'Patients';
    if (path.includes('/appointments')) return 'Appointments';
    return 'Doctor Portal';
  };
  
  return (
    <div className="layout-container">
      <DoctorSidebar />
      <div className="content-wrapper">
        <Header pageTitle={getPageTitle()} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
