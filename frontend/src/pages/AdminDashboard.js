import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import UserManagement from '../components/admin/UserManagement';
import DoctorVerifications from '../components/admin/DoctorVerifications';
import SystemStats from '../components/admin/SystemStats';
import SystemSettings from '../components/admin/SystemSettings';
import AdminProfile from '../components/admin/AdminProfile';

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect if not an admin
  if (currentUser.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SystemStats />;
      case 'users':
        return <UserManagement />;
      case 'verifications':
        return <DoctorVerifications />;
      case 'settings':
        return <SystemSettings />;
      case 'profile':
        return <AdminProfile />;
      default:
        return <SystemStats />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {currentUser.name}</p>
      </div>

      <div className="dashboard-nav">
        <ul className="tab-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''}>
            <button onClick={() => setActiveTab('dashboard')}>
              Dashboard
            </button>
          </li>
          <li className={activeTab === 'users' ? 'active' : ''}>
            <button onClick={() => setActiveTab('users')}>
              User Management
            </button>
          </li>
          <li className={activeTab === 'verifications' ? 'active' : ''}>
            <button onClick={() => setActiveTab('verifications')}>
              Doctor Verifications
            </button>
          </li>
          <li className={activeTab === 'settings' ? 'active' : ''}>
            <button onClick={() => setActiveTab('settings')}>
              System Settings
            </button>
          </li>
          <li className={activeTab === 'profile' ? 'active' : ''}>
            <button onClick={() => setActiveTab('profile')}>
              Admin Profile
            </button>
          </li>
        </ul>
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
