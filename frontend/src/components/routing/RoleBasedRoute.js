import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default RoleBasedRoute;
