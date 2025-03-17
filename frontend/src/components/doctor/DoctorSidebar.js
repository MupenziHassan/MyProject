import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/Sidebar.css';

const DoctorSidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Doctor Portal</h3>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/doctor/dashboard" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/doctor/appointments" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>Appointments</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/doctor/patients" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-user-injured"></i>
              <span>My Patients</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/doctor/availability" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-clock"></i>
              <span>Set Availability</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/doctor/messages" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-envelope"></i>
              <span>Messages</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/doctor/profile" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-user-md"></i>
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DoctorSidebar;
