import React, { useState } from 'react';
import { testAllServerPorts } from '../../utils/testServerConnection';

const ServerConnectionTest = ({ onConnectionSuccess }) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const connectionResult = await testAllServerPorts();
      setResults(connectionResult);
      
      if (connectionResult.success && onConnectionSuccess) {
        onConnectionSuccess(connectionResult.port);
      }
    } catch (error) {
      setResults({
        success: false,
        message: `Error testing connection: ${error.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="server-connection-test">
      <h4>Server Connection Test</h4>
      
      <p>
        If you're having trouble connecting to the server, click the button below to test 
        all possible backend ports.
      </p>
      
      <button 
        onClick={handleTest} 
        disabled={testing}
        className="test-button"
      >
        {testing ? 'Testing...' : 'Test Server Connection'}
      </button>
      
      {results && (
        <div className={`test-results ${results.success ? 'success' : 'error'}`}>
          <p><strong>{results.success ? '✅ Success!' : '❌ Failed:'}</strong> {results.message}</p>
          
          {results.port && (
            <p>Connected to port: {results.port}</p>
          )}
          
          {!results.success && (
            <>
              <p>
                <button 
                  className="details-toggle" 
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </p>
              
              {showDetails && results.details && (
                <div className="error-details">
                  <h5>Connection attempts:</h5>
                  <ul>
                    {results.details.map((result, index) => (
                      <li key={index}>
                        Port {result.port}: {result.success ? 'Success' : `Failed (${result.error})`}
                      </li>
                    ))}
                  </ul>
                  
                  <h5>Troubleshooting steps:</h5>
                  <ol>
                    <li>Check if the backend server is running</li>
                    <li>Verify the server is running on one of the tested ports</li>
                    <li>Check for network or firewall issues</li>
                    <li>Restart the backend server</li>
                    <li>Refresh this page and try again</li>
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      <style jsx="true">{`
        .server-connection-test {
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        
        .test-button {
          background-color: #4a5568;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .test-button:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }
        
        .test-results {
          margin-top: 15px;
          padding: 10px;
          border-radius: 4px;
        }
        
        .success {
          background-color: #d1fae5;
          border: 1px solid #10b981;
        }
        
        .error {
          background-color: #fee2e2;
          border: 1px solid #ef4444;
        }
        
        .details-toggle {
          background: none;
          border: none;
          color: #2563eb;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }
        
        .error-details {
          margin-top: 10px;
          font-size: 14px;
        }
        
        .error-details h5 {
          margin-top: 10px;
          margin-bottom: 5px;
        }
        
        .error-details ul, .error-details ol {
          margin-top: 5px;
          padding-left: 20px;
        }
        
        .error-details li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default ServerConnectionTest;
