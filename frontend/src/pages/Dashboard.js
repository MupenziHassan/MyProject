import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect to role-specific dashboard
  switch (currentUser.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'doctor':
      return <Navigate to="/doctor/dashboard" />;
    case 'patient':
      return <Navigate to="/patient/dashboard" />;
    default:
      return <Navigate to="/" />;
  }
};

export default Dashboard;
