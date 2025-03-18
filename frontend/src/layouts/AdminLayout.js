import React from 'react';
import MainLayout from '../components/layouts/MainLayout';

const AdminLayout = () => {
  const navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt' },
    { path: 'users', label: 'User Management', icon: 'users-cog' },
    { path: 'settings', label: 'System Settings', icon: 'cogs' }
  ];

  return (
    <MainLayout 
      navItems={navItems}
      navColor="dark"
      brandText="Ubumuntu System Administration"
      rolePrefix="admin"
    />
  );
};

export default AdminLayout;
