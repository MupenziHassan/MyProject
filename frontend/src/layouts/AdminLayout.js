import React from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
    >
      <Nav className="me-auto">
        <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
        <Nav.Link as={Link} to="/admin/users">User Management</Nav.Link>
        <Nav.Link as={Link} to="/admin/settings">System Settings</Nav.Link>
        <Nav.Link as={Link} to="/admin/analytics">Analytics</Nav.Link>
      </Nav>
    </MainLayout>
  );
};

export default AdminLayout;
