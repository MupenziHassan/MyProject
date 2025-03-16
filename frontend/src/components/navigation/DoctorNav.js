import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const DoctorNav = () => {
  const { currentUser } = useContext(AuthContext);
  
  // Ensure navLinks is properly defined as an array
  const navLinks = [
    {
      path: '/doctor/dashboard',
      icon: 'columns',
      label: 'Dashboard'
    },
    {
      path: '/doctor/patients',
      icon: 'users',
      label: 'Patients'
    },
    {
      path: '/doctor/tests',
      icon: 'vial',
      label: 'Tests'
    },
    {
      path: '/doctor/predictions',
      icon: 'chart-line',
      label: 'Predictions'
    },
    {
      path: '/doctor/appointments',
      icon: 'calendar-alt',
      label: 'Appointments'
    },
    {
      path: '/doctor/availability',
      icon: 'clock',
      label: 'My Availability'
    },
    {
      path: '/doctor/messages',
      icon: 'comment-medical',
      label: 'Messages'
    },
    {
      path: '/doctor/profile',
      icon: 'user-md',
      label: 'Profile'
    }
  ];

  return (
    <nav className="doctor-nav">
      {/* ...existing code... */}
      
      <ul className="nav-links">
        {navLinks.map((link, index) => (
          <li key={index} className="nav-item">
            <NavLink 
              to={link.path} 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <i className={`fas fa-${link.icon}`}></i>
              <span className="link-text">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      
      {/* ...existing code... */}
    </nav>
  );
};

export default DoctorNav;
