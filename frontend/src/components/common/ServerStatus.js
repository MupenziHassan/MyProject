import React, { useState, useEffect } from 'react';
import { checkServerStatus } from '../../utils/serverStatus';

const ServerStatus = () => {
  const [status, setStatus] = useState({
    checked: false,
    running: false,
    message: 'Checking server status...'
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const isRunning = await checkServerStatus();
        
        setStatus({
          checked: true,
          running: isRunning,
          message: isRunning 
            ? 'Backend server is online and accessible.'
            : 'Backend server is offline or inaccessible. Please ensure it\'s running on port 9091.'
        });
      } catch (error) {
        setStatus({
          checked: true,
          running: false,
          message: `Error checking server status: ${error.message}`
        });
      }
    };
    
    checkStatus();
    
    // Check server status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status.checked) {
    return null;
  }

  return (
    <div className={`server-status ${status.running ? 'server-online' : 'server-offline'}`}>
      <div className="status-indicator">
        <span className={`status-dot ${status.running ? 'online' : 'offline'}`}></span>
        <span className="status-text">
          {status.running ? 'Server Online' : 'Server Offline'}
        </span>
      </div>
      {!status.running && (
        <div className="status-message">
          {status.message}
        </div>
      )}
      <style jsx="true">{`
        .server-status {
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
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
          height: 10px;
          width: 10px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .online {
          background-color: #34d399;
        }
        .offline {
          background-color: #f87171;
        }
        .status-message {
          margin-top: 5px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default ServerStatus;
