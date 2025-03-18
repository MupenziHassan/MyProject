import React, { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * ConnectionStatus - A lightweight component to check server connectivity
 * and display appropriate status/error messages
 */
function ConnectionStatus() {
  const [status, setStatus] = useState({
    checking: true,
    connected: false,
    message: 'Checking server connection...',
    port: null
  });
  
  const checkConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, checking: true }));
      const health = await api.checkHealth();
      
      setStatus({
        checking: false,
        connected: health.running,
        message: health.message,
        port: health.port
      });
    } catch (error) {
      setStatus({
        checking: false,
        connected: false,
        message: 'Could not connect to server',
        port: null
      });
    }
  };
  
  useEffect(() => {
    checkConnection();
    
    // Check periodically
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const handleRetry = () => {
    checkConnection();
  };
  
  // If still checking, show minimal indicator
  if (status.checking) {
    return (
      <div className="connection-status checking">
        <div className="spinner"></div>
        <span>Checking server connection...</span>
      </div>
    );
  }
  
  // If connected, show success status
  if (status.connected) {
    return (
      <div className="connection-status connected">
        <span className="status-dot"></span>
        <span>Connected to server {status.port ? `on port ${status.port}` : ''}</span>
      </div>
    );
  }
  
  // If not connected, show error with retry button
  return (
    <div className="connection-status error">
      <p>⚠️ {status.message}</p>
      <button onClick={handleRetry}>Retry Connection</button>
      
      <div className="help-text">
        <p>To resolve this issue:</p>
        <ol>
          <li>Make sure the backend server is running</li>
          <li>Check for any error messages in the console</li>
          <li>Verify the server is running on port 9090 (or another available port)</li>
        </ol>
      </div>
    </div>
  );
}

export default ConnectionStatus;
