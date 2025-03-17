import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/Sidebar.css';

const PatientSidebar = () => {
  // Removed the unused location variable
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Patient Portal</h3>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/patient/dashboard" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/patient/health-dashboard" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-heartbeat"></i>
              <span>Health Dashboard</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/patient/appointments" 
              className={({isActive}) => isActive ? 'active' : ''}
              end // Only exact match
            >
              <i className="fas fa-calendar-alt"></i>
              <span>Appointments</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/patient/health-data/submit" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-notes-medical"></i>
              <span>Submit Health Data</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/patient/test-results" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-flask"></i>
              <span>Test Results</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/patient/health-assessment" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-clipboard-check"></i>
              <span>Health Assessment</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/patient/profile" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default PatientSidebar;
