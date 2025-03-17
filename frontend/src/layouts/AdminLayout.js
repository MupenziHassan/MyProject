import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import Header from '../components/common/Header';
import '../styles/Layout.css';

const AdminLayout = () => {
  const location = useLocation();
  
  // Get current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Admin Dashboard';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/settings')) return 'System Settings';
    return 'Admin Portal';
  };
  
  return (
    <div className="layout-container">
      <AdminSidebar />
      <div className="content-wrapper">
        <Header pageTitle={getPageTitle()} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
