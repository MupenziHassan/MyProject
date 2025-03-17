import React, { useState, useEffect } from 'react';
import { checkServerStatus, getServerStartInstructions } from '../../utils/serverStatus';

const ServerStatus = ({ onStatusChange }) => {
  const [status, setStatus] = useState({
    checked: false,
    running: false,
    message: 'Checking server status...',
    port: null,
    showInstructions: false,
    retrying: false
  });

  const checkStatus = async () => {
    try {
      const serverStatus = await checkServerStatus();
      
      const newStatus = {
        checked: true,
        running: serverStatus.connected,
        port: serverStatus.port || null,
        retrying: false,
        message: serverStatus.connected 
          ? `Backend server is online on port ${serverStatus.port}.`
          : 'Backend server is offline. Please start the server to use all features.',
        serverTime: serverStatus.serverTime,
        uptime: serverStatus.uptime,
        environment: serverStatus.environment
      };
      
      setStatus(prev => ({
        ...prev,
        ...newStatus
      }));
      
      // Call the optional callback if provided
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        checked: true,
        running: false,
        retrying: false,
        message: `Error checking server status: ${error.message}`
      }));
      
      if (onStatusChange) {
        onStatusChange({ running: false, error: error.message });
      }
    }
  };

  // Initial check on component mount
  useEffect(() => {
    checkStatus();
    
    // Check server status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleRetry = () => {
    setStatus(prev => ({
      ...prev,
      retrying: true,
      message: 'Retrying connection...'
    }));
    
    setTimeout(checkStatus, 1000);
  };

  const toggleInstructions = () => {
    setStatus(prev => ({
      ...prev,
      showInstructions: !prev.showInstructions
    }));
  };

  if (!status.checked) {
    return (
      <div className="server-status-checking">
        <div className="status-spinner"></div>
        <span>Checking server connection...</span>
      </div>
    );
  }

  return (
    <div className={`server-status ${status.running ? 'server-online' : 'server-offline'}`}>
      <div className="status-indicator">
        <span className={`status-dot ${status.running ? 'online' : 'offline'}`}></span>
        <span className="status-text">
          {status.running ? `Server Online (Port ${status.port})` : 'Server Offline'}
        </span>
      </div>
      
      {status.message && (
        <div className="status-message">
          {status.message}
        </div>
      )}
      
      {status.running && status.uptime && (
        <div className="status-details">
          <small>Uptime: {status.uptime}</small>
        </div>
      )}
      
      {!status.running && (
        <div className="status-actions">
          <button 
            className="retry-button" 
            onClick={handleRetry} 
            disabled={status.retrying}
          >
            {status.retrying ? 'Retrying...' : 'Retry Connection'}
          </button>
          <button 
            className="instructions-toggle" 
            onClick={toggleInstructions}
          >
            {status.showInstructions ? 'Hide Instructions' : 'Show Start Instructions'}
          </button>
        </div>
      )}
      
      {!status.running && status.showInstructions && (
        <div className="start-instructions">
          <h4>How to start the server:</h4>
          <ol>
            {getServerStartInstructions().map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      
      <style jsx="true">{`
        .server-status {
          padding: 12px 15px;
          border-radius: 4px;
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }
        .server-status-checking {
          display: flex;
          align-items: center;
          padding: 10px;
          background-color: #f0f0f0;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        .status-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ccc;
          border-top-color: #666;
          border-radius: 50%;
          margin-right: 10px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .server-offline {
          background-color: #fde8e8;
          border: 1px solid #f8b4b4;
        }
        .server-online {
          background-color: #e6f6e6;
          border: 1px solid #a3d9a3;
        }
        .status-indicator {
          display: flex;
          align-items: center;
        }
        .status-dot {
          height: 12px;
          width: 12px;
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
        .status-details {
          margin-top: 4px;
          font-size: 12px;
          color: #555;
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
          background-color: #e0e0e0;
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

export default ServerStatus;
