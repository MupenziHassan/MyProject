import React from 'react';
import MainLayout from '../components/layouts/MainLayout';

const PatientLayout = () => {
  const navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: 'home' },
    { path: 'health-assessment', label: 'Health Assessment', icon: 'clipboard-check' },
    { path: 'appointments', label: 'Appointments', icon: 'calendar-alt' }
  ];

  return (
    <MainLayout 
      navItems={navItems}
      navColor="primary"
      brandText="Ubumuntu Cancer Prediction"
      rolePrefix="patient"
    />
  );
};

export default PatientLayout;
