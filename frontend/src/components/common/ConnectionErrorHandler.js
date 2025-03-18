import React, { useState, useEffect } from 'react';
import apiService from '../../utils/apiConfig';
import { getServerStartInstructions } from '../../utils/serverStatus';
import ServerConnectionTest from './ServerConnectionTest';

const ConnectionErrorHandler = ({ children }) => {
  const [connectionState, setConnectionState] = useState({
    isChecking: true,
    isConnected: false,
    error: null,
    apiUrl: null,
    retryCount: 0,
    showInstructions: false,
  });

  const checkConnection = async () => {
    try {
      setConnectionState(prev => ({ 
        ...prev, 
        isChecking: true 
      }));

      // Get the current API URL
      const apiUrl = apiService.defaults.baseURL;
      
      // Try to connect to the server
      const healthStatus = await apiService.checkHealth();
      
      if (healthStatus.running) {
        setConnectionState({
          isChecking: false,
          isConnected: true,
          error: null,
          apiUrl,
          retryCount: 0,
          showInstructions: false
        });
      } else {
        setConnectionState(prev => ({
          isChecking: false,
          isConnected: false,
          error: healthStatus.message || 'Could not connect to the server',
          apiUrl,
          retryCount: prev.retryCount + 1,
          showInstructions: false
        }));
      }
    } catch (err) {
      setConnectionState(prev => ({
        isChecking: false,
        isConnected: false,
        error: err.message || 'Could not connect to the server',
        apiUrl: apiService.defaults.baseURL,
        retryCount: prev.retryCount + 1,
        showInstructions: false
      }));
    }
  };

  useEffect(() => {
    // Check connection when component mounts
    checkConnection();
    
    // Also set up a periodic check every 30 seconds
    const intervalId = setInterval(() => {
      // Only auto-retry if we're not connected and not currently checking
      if (!connectionState.isConnected && !connectionState.isChecking) {
        checkConnection();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [connectionState.isConnected, connectionState.isChecking]); // Add missing dependencies

  const handleRetry = () => {
    checkConnection();
  };

  const handleToggleInstructions = () => {
    setConnectionState(prev => ({
      ...prev,
      showInstructions: !prev.showInstructions
    }));
  };

  const handleConnectionSuccess = (port) => {
    setConnectionState({
      isChecking: false,
      isConnected: true,
      error: null,
      apiUrl: `http://localhost:${port}`,
      retryCount: 0,
      showInstructions: false
    });
  };

  // If still checking or connection is successful, render children
  if (connectionState.isChecking) {
    return (
      <div className="connection-checking">
        <div className="connection-spinner"></div>
        <h3>Connecting to server...</h3>
      </div>
    );
  }

  // If connected, render the children
  if (connectionState.isConnected) {
    return children;
  }

  // If not connected, show error message
  return (
    <div className="connection-error-container">
      <div className="connection-error-box">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        
        <h2>Server Connection Error</h2>
        
        <div className="error-message">
          <p>{connectionState.error}</p>
          <p>Tried connecting to: <code>{connectionState.apiUrl}</code></p>
        </div>
        
        <div className="action-buttons">
          <button 
            className="retry-button"
            onClick={handleRetry}
            disabled={connectionState.isChecking}
          >
            {connectionState.isChecking ? 'Connecting...' : 'Retry Connection'}
          </button>
          
          <button 
            className="instructions-button"
            onClick={handleToggleInstructions}
          >
            {connectionState.showInstructions ? 'Hide Instructions' : 'Show Instructions'}
          </button>
        </div>
        
        {connectionState.showInstructions && (
          <div className="server-instructions">
            <h4>How to start the server:</h4>
            <ol>
              {getServerStartInstructions().map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
            <p><strong>Quick Start:</strong> Use the <code>start-project.bat</code> file in the project root directory.</p>
          </div>
        )}

        <ServerConnectionTest onConnectionSuccess={handleConnectionSuccess} />
      </div>
      
      <style jsx="true">{`
        .connection-error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f8f9fa;
        }
        
        .connection-error-box {
          background: white;
          border-radius: 8px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          padding: 30px;
          width: 100%;
          max-width: 600px;
          text-align: center;
        }
        
        .error-icon {
          font-size: 48px;
          color: #e74c3c;
          margin-bottom: 20px;
        }
        
        h2 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .error-message {
          margin-bottom: 20px;
          color: #555;
        }
        
        .error-message code {
          background: #f8f9fa;
          padding: 3px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 25px;
        }
        
        .retry-button, .instructions-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .retry-button {
          background-color: #3498db;
          color: white;
        }
        
        .retry-button:hover {
          background-color: #2980b9;
        }
        
        .instructions-button {
          background-color: #f0f0f0;
          color: #333;
        }
        
        .instructions-button:hover {
          background-color: #e0e0e0;
        }
        
        .server-instructions {
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 15px;
          text-align: left;
          margin-bottom: 20px;
        }
        
        .server-instructions h4 {
          margin-top: 0;
        }
        
        .server-instructions ol {
          padding-left: 20px;
        }
        
        .server-instructions li {
          margin-bottom: 8px;
        }
        
        .connection-checking {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        
        .connection-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConnectionErrorHandler;
