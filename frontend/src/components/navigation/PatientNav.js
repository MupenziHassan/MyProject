import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PatientNav = () => {
  const { currentUser } = useContext(AuthContext);
  
  // Ensure navLinks is properly defined as an array
  const navLinks = [
    {
      path: '/patient/dashboard',
      icon: 'columns',
      label: 'Dashboard'
    },
    {
      path: '/patient/health-data',
      icon: 'heartbeat',
      label: 'Health Data'
    },
    {
      path: '/patient/tests',
      icon: 'vial',
      label: 'My Tests'
    },
    {
      path: '/patient/predictions',
      icon: 'chart-line',
      label: 'Risk Predictions'
    },
    {
      path: '/patient/appointments',
      icon: 'calendar-check',
      label: 'Appointments'
    },
    {
      path: '/patient/doctors',
      icon: 'user-md',
      label: 'Find Doctors'
    },
    {
      path: '/patient/messages',
      icon: 'comment-medical',
      label: 'Messages'
    },
    {
      path: '/patient/profile',
      icon: 'user',
      label: 'Profile'
    }
  ];

  return (
    <nav className="patient-nav">
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

export default PatientNav;
