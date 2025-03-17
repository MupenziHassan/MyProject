import axios from 'axios';
import { setupAxios } from './setupAxios';

/**
 * A comprehensive server status checker with dynamic port detection
 */
export const checkServerStatus = async () => {
  try {
    // First try to connect to the server using our dynamic port detection
    const config = await setupAxios();
    
    if (config.error) {
      console.log('Connection failed in serverCheck:', config.error);
      // Try direct connections to various ports as fallback
      return await performDirectPortChecks();
    }
    
    // If we successfully connected, try accessing the health check endpoint
    try {
      const response = await axios.get(`http://localhost:${config.port}/api/health-check`, {
        timeout: 3000
      });
      
      return {
        connected: true,
        port: config.port,
        method: 'api-detection',
        serverTime: response.data.timestamp,
        uptime: response.data.status?.uptime || 'unknown',
        environment: response.data.environment || 'unknown'
      };
    } catch (healthCheckError) {
      console.warn(`Health check failed despite successful connection detection:`, healthCheckError.message);
      
      // Return basic connection info
      return {
        connected: true,
        port: config.port,
        method: 'basic-detection',
        warning: 'Health check endpoint not available'
      };
    }
  } catch (error) {
    console.error('Server connection error:', error.message);
    return {
      connected: false,
      error: 'Could not connect to any server port'
    };
  }
};

/**
 * Try direct connections to various ports as a fallback method
 */
const performDirectPortChecks = async () => {
  // Try the proxy first
  try {
    const response = await axios.get('/api/v1/status');
    if (response.data && response.data.success) {
      return {
        connected: true,
        port: response.data.port,
        method: 'proxy',
        serverTime: response.data.serverTime
      };
    }
  } catch (proxyError) {
    console.log('Proxy connection failed, trying direct connections...');
  }

  // Try direct connections to various ports
  const ports = [9091, 9090, 9092, 9093, 9094, 9095, 5000, 8000];
  
  for (const port of ports) {
    try {
      const response = await axios.get(`http://localhost:${port}/api/v1/status`, {
        timeout: 2000
      });
      
      if (response.data && response.data.success) {
        // Cache working port for future use
        localStorage.setItem('api_port', port.toString());
        
        return {
          connected: true,
          port: port,
          method: 'direct',
          serverTime: response.data.serverTime
        };
      }
    } catch (error) {
      console.log(`Failed to connect on port ${port}`);
    }
  }
  
  return {
    connected: false,
    error: 'Could not connect to any server port'
  };
};

// Function to run a server connectivity test and display results on the console
export const runServerCheck = async () => {
  console.log('Checking server connectivity...');
  const status = await checkServerStatus();
  
  if (status.connected) {
    console.log('✅ Server connected!');
    console.log(`Method: ${status.method}`);
    console.log(`Port: ${status.port}`);
    if (status.serverTime) console.log(`Server time: ${status.serverTime}`);
    return true;
  } else {
    console.error('❌ Server connection failed');
    console.error(status.error);
    return false;
  }
};

export default { checkServerStatus, runServerCheck };
