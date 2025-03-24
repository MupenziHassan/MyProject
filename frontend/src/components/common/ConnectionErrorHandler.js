import React, { useState, useEffect } from 'react';
import apiConnection from '../../utils/apiConnection';

const ConnectionErrorHandler = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check connection on mount but with a delay
    const timer = setTimeout(() => {
      checkConnection();
    }, 1500);
    
    // Listen for connection status changes
    window.addEventListener('api-connection-changed', handleConnectionChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('api-connection-changed', handleConnectionChange);
    };
  }, []);
  
  // Only show error container after we confirm there's an issue
  useEffect(() => {
    if (connectionError || dbError) {
      // Only make visible if actually needed
      setIsVisible(true);
    }
  }, [connectionError, dbError]);
  
  const handleConnectionChange = (event) => {
    setConnectionError(!event.detail.connected);
    
    // If connected, check database status
    if (event.detail.connected) {
      const dbStatus = apiConnection.getDatabaseStatus();
      setDbError(dbStatus !== 'connected');
    }
  };
  
  const checkConnection = async () => {
    try {
      const healthCheck = await apiConnection.checkHealth();
      setConnectionError(!healthCheck.connected);
      setDbError(healthCheck.database !== 'connected');
    } catch (error) {
      // Don't automatically show errors on login/registration page
      const isLoginPage = window.location.pathname === '/login' || 
                          window.location.pathname === '/register' ||
                          window.location.pathname === '/';
                          
      if (!isLoginPage) {
        setConnectionError(true);
        setDbError(true);
      }
    }
  };
  
  const handleRetry = async () => {
    setRetrying(true);
    
    try {
      await apiConnection.initConnection();
      await checkConnection();
    } catch (error) {
      console.warn('Retry failed:', error);
    } finally {
      setRetrying(false);
    }
  };
  
  const getServerStartInstructions = () => {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    
    if (isWindows) {
      return [
        '1. Open Command Prompt as Administrator',
        '2. Navigate to the project directory: cd path\\to\\Health-prediction-system',
        '3. Start the backend: cd backend && npm start',
        '4. Wait for "Server running on port XXXX" message'
      ];
    } else {
      return [
        '1. Open Terminal',
        '2. Navigate to the project directory: cd path/to/Health-prediction-system',
        '3. Start the backend: cd backend && npm start',
        '4. Wait for "Server running on port XXXX" message'
      ];
    }
  };
  
  // Don't render anything if on login/register page or if no errors detected
  if ((!connectionError && !dbError) || !isVisible) {
    return null;
  }
  
  return (
    <div className="connection-error-container">
      <div className="connection-error-dialog">
        <div className="error-status">
          <div className={`status-indicator ${connectionError ? 'offline' : 'online'}`}></div>
          <div className="status-text">
            {connectionError ? 'Server Offline' : 'Server Online'}
          </div>
        </div>
        
        {!connectionError && dbError && (
          <div className="status-message">
            <strong>Database Connection Issue:</strong> The server is running, but 
            cannot connect to the database. Please check your MongoDB connection.
          </div>
        )}
        
        {connectionError && (
          <div className="status-message">
            <strong>Server Connection Error:</strong> Cannot connect to the API server. 
            The server might not be running or there might be a network issue.
          </div>
        )}
        
        <div className="status-actions">
          <button 
            className="retry-button" 
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? 'Retrying...' : 'Retry Connection'}
          </button>
          
          <button 
            className="instructions-toggle"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
          </button>
          
          <button
            className="close-button"
            onClick={() => setIsVisible(false)}
          >
            Dismiss
          </button>
        </div>
        
        {showInstructions && (
          <div className="start-instructions">
            <h4>How to start the server:</h4>
            <ol>
              {getServerStartInstructions().map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
      
      <style jsx="true">{`
        .connection-error-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          max-width: 400px;
        }
        .connection-error-dialog {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          border-left: 4px solid #f87171;
        }
        .error-status {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .online {
          background-color: #34d399;
        }
        .offline {
          background-color: #f87171;
        }
        .status-text {
          font-weight: 500;
        }
        .status-message {
          margin-top: 5px;
          font-size: 14px;
        }
        .status-actions {
          margin-top: 10px;
          display: flex;
          gap: 8px;
        }
        .retry-button, .instructions-toggle {
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
        }
        .retry-button {
          background-color: #3b82f6;
          color: white;
        }
        .retry-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }
        .instructions-toggle {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
        }
        .close-button {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        .start-instructions {
          margin-top: 10px;
          padding: 10px;
          background-color: #f9fafb;
          border-radius: 4px;
          font-size: 14px;
        }
        .start-instructions h4 {
          margin-top: 0;
          margin-bottom: 8px;
        }
        .start-instructions ol {
          margin: 0;
          padding-left: 20px;
        }
        .start-instructions li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default ConnectionErrorHandler;
