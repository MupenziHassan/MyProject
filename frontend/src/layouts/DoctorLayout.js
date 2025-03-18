import React from 'react';
import MainLayout from '../components/layouts/MainLayout';

const DoctorLayout = () => {
  const navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: 'home' },
    { path: 'patients', label: 'Patients', icon: 'users' },
    { path: 'appointments', label: 'Appointments', icon: 'calendar-alt' },
    { path: 'assessments', label: 'Risk Assessments', icon: 'clipboard-list' }
  ];

  return (
    <MainLayout 
      navItems={navItems}
      navColor="success"
      brandText="Ubumuntu Clinic - Doctor Portal"
      rolePrefix="doctor"
    />
  );
};

export default DoctorLayout;
