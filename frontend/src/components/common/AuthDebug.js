import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const AuthDebug = () => {
  const { auth } = useContext(AuthContext);
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      right: 0, 
      background: '#f0f0f0', 
      padding: '10px',
      border: '1px solid #ccc',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      opacity: 0.8
    }}>
      <h4>Auth Debug Info</h4>
      <div>
        <strong>Authenticated:</strong> {auth?.isAuthenticated ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Role:</strong> {auth?.role || 'None'}
      </div>
      <div>
        <strong>User:</strong> {auth?.user?.name || 'None'}
      </div>
      <div>
        <strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}
      </div>
      <div>
        <strong>Path:</strong> {window.location.pathname}
      </div>
    </div>
  );
};

export default AuthDebug;
