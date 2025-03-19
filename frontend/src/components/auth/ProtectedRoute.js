import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { auth } = useContext(AuthContext);
  
  // Check if user is authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    // Redirect to the appropriate dashboard based on role
    if (auth.role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    } else if (auth.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (auth.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  // If authenticated and authorized, render the component
  return children;
};

export default ProtectedRoute;
