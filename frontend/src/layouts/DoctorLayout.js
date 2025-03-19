import React from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
    >
      <Nav className="me-auto">
        <Nav.Link as={Link} to="/doctor/dashboard">Dashboard</Nav.Link>
        <Nav.Link as={Link} to="/doctor/patients">Patients</Nav.Link>
        <Nav.Link as={Link} to="/doctor/assessments">Risk Assessments</Nav.Link>
        <Nav.Link as={Link} to="/doctor/appointments">Appointments</Nav.Link>
      </Nav>
    </MainLayout>
  );
};

export default DoctorLayout;
