import React, { useState, useEffect } from 'react';
import { testDatabaseConnection, testDataFetch } from '../../utils/dbTester';

const DatabaseCheck = () => {
  const [dbStatus, setDbStatus] = useState({
    checking: true,
    connected: false,
    details: null,
    error: null
  });
  
  const [dataStatus, setDataStatus] = useState({
    checking: true,
    real: false,
    mock: false,
    error: null
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testDatabaseConnection();
        setDbStatus({
          checking: false,
          connected: result.isConnected,
          details: result.details,
          error: result.error
        });
      } catch (error) {
        setDbStatus({
          checking: false,
          connected: false,
          details: null,
          error: error.response?.status === 429 
            ? "Rate limit exceeded. Server is busy, try again later." 
            : error.message
        });
      }
    };
    
    const checkData = async () => {
      try {
        const result = await testDataFetch();
        setDataStatus({
          checking: false,
          real: result.success && !result.isMockData,
          mock: result.success && result.isMockData,
          error: result.error
        });
      } catch (error) {
        setDataStatus({
          checking: false,
          real: false,
          mock: false,
          error: error.response?.status === 429 
            ? "Rate limit exceeded. Server is busy, try again later." 
            : error.message
        });
      }
    };
    
    // Add delays between checks to prevent triggering rate limits
    checkConnection();
    const timer = setTimeout(checkData, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="database-check">
      <h3>Database Status</h3>
      
      {dbStatus.checking ? (
        <p>Checking database connection...</p>
      ) : dbStatus.connected ? (
        <div className="status-positive">
          <i className="fas fa-check-circle"></i>
          <span>Connected to database: {dbStatus.details?.dbHost}</span>
        </div>
      ) : (
        <div className="status-negative">
          <i className="fas fa-exclamation-circle"></i>
          <span>Not connected to database</span>
          {dbStatus.error && <p className="error-detail">{dbStatus.error}</p>}
        </div>
      )}
      
      <h3>Data Source</h3>
      
      {dataStatus.checking ? (
        <p>Checking data source...</p>
      ) : dataStatus.real ? (
        <div className="status-positive">
          <i className="fas fa-database"></i>
          <span>Using real data from database</span>
        </div>
      ) : dataStatus.mock ? (
        <div className="status-warning">
          <i className="fas fa-theater-masks"></i>
          <span>Using mock data</span>
        </div>
      ) : (
        <div className="status-negative">
          <i className="fas fa-exclamation-circle"></i>
          <span>Unable to determine data source</span>
          {dataStatus.error && <p className="error-detail">{dataStatus.error}</p>}
        </div>
      )}
    </div>
  );
};

export default DatabaseCheck;
