import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/Sidebar.css';

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Admin Portal</h3>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/admin/dashboard" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/users" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-users-cog"></i>
              <span>User Management</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/appointments" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>Appointments</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/reports" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-chart-bar"></i>
              <span>Reports</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/settings" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/logs" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-clipboard-list"></i>
              <span>System Logs</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/profile" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              <i className="fas fa-user-shield"></i>
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
