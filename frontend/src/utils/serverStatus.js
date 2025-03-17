import axios from 'axios';
import apiService from './apiConfig';
import { setupAxios } from './setupAxios';

/**
 * Comprehensive server connection checker with dynamic port detection
 * @returns {Promise<{connected: boolean, port?: number, error?: string, serverTime?: string}>}
 */
export const checkServerConnection = async () => {
  console.log('Checking server connection...');
  
  try {
    // Use our dynamic port detection system
    const config = await setupAxios();
    
    if (!config.success) {
      console.log('Connection failed:', config.error);
      return { connected: false, error: config.error };
    }
    
    // Try to get detailed server status for extra info
    try {
      const statusUrl = `http://localhost:${config.port}/api/v1/status`;
      const statusResponse = await axios.get(statusUrl, { timeout: 3000 });
      
      if (statusResponse.data && statusResponse.data.success) {
        return { 
          connected: true,
          port: config.port,
          serverTime: statusResponse.data.serverTime,
          environment: statusResponse.data.environment,
          uptime: statusResponse.data.uptime || 'unknown'
        };
      }
    } catch (statusError) {
      // If detailed status fails, return basic connection info
      console.log('Could not get detailed status, but server is running');
    }
    
    return { 
      connected: true,
      port: config.port
    };
  } catch (error) {
    console.log('Server connection error:', error.message);
    return {
      connected: false,
      error: 'Could not connect to backend server on any expected port'
    };
  }
};

/**
 * Gets OS-specific server start instructions 
 * @returns {string[]} List of instructions
 */
export const getServerStartInstructions = () => {
  const isWindows = navigator.platform.toLowerCase().includes('win');
  
  if (isWindows) {
    return [
      '1. Open Command Prompt as Administrator',
      '2. Navigate to the backend directory: cd path\\to\\Health-prediction-system\\backend',
      '3. Run the server: node server.js',
      '4. Alternative: Use the "npm run dev" command from the project root'
    ];
  } else {
    return [
      '1. Open Terminal',
      '2. Navigate to the backend directory: cd path/to/Health-prediction-system/backend',
      '3. Run the server: node server.js',
      '4. Alternative: Use the "npm run dev" command from the project root'
    ];
  }
};

/**
 * Checks server status with retry mechanism
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<{running: boolean, message: string, port?: string}>}
 */
export const checkServerStatus = async (retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // First try the health-check endpoint
      const response = await apiService.get('/api/health-check');
      
      if (response.data && response.data.success) {
        return { 
          running: true, 
          message: 'Connected to server',
          port: localStorage.getItem('api_port') || '9091',
          serverTime: response.data.timestamp,
          uptime: response.data.uptime
        };
      } else {
        // Health check endpoint responded but with unexpected format
        return { 
          running: true, 
          message: 'Server connection issues - unexpected response format',
          port: localStorage.getItem('api_port') || '9091'
        };
      }
    } catch (error) {
      console.error(`Server connection error (attempt ${attempt + 1}):`, error.message);
      
      if (attempt === retries) {
        // Final retry failed, try dynamic port detection as last resort
        try {
          const connectionCheck = await checkServerConnection();
          
          if (connectionCheck.connected) {
            return {
              running: true,
              message: 'Connected to server via fallback method',
              port: connectionCheck.port.toString()
            };
          } else {
            return { 
              running: false, 
              message: 'Cannot connect to the backend server. Please ensure it\'s running.'
            };
          }
        } catch (finalError) {
          return { 
            running: false, 
            message: 'Cannot connect to the backend server. Please ensure it\'s running.'
          };
        }
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

/**
 * Complete setup of a connection to the backend server
 * @returns {Promise<{running: boolean, message: string, port?: string}>} 
 */
export const setupConnection = async () => {
  try {
    // First set up dynamic port detection
    const config = await setupAxios();
    
    if (!config.success) {
      return { running: false, message: config.error };
    }
    
    // Set auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setAuthToken(token);
    }
    
    // Check server status using configured ports
    const status = await checkServerStatus();
    return {
      ...status,
      port: config.port.toString()
    };
  } catch (error) {
    console.error('Failed to set up connection:', error);
    return { running: false, message: error.message };
  }
};
