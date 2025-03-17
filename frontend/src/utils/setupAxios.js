import axios from 'axios';
import fs from 'fs';

/**
 * Setup Axios with dynamic port detection for backend server
 * This is a comprehensive port detection system that tries multiple methods
 * to find the running backend server port
 */
export const setupAxios = async () => {
  try {
    // Step 1: Check localStorage for cached port that worked previously
    const cachedPort = localStorage.getItem('api_port');
    if (cachedPort) {
      console.log(`Trying cached port from localStorage: ${cachedPort}`);
      try {
        const response = await axios.get(`http://localhost:${cachedPort}/api/health-check`, { 
          timeout: 2000 
        });
        if (response.data && response.data.success) {
          console.log(`Successfully connected using cached port: ${cachedPort}`);
          return { success: true, port: cachedPort };
        }
      } catch (cachedError) {
        console.log('Cached port failed, continuing with port discovery...');
        // Continue to other methods if cached port fails
      }
    }

    // Step 2: Try to read the port from the backend's server-port.txt file
    try {
      // Note: This won't work in browser environment directly
      // This code path is primarily for development with local server
      // or when running inside Electron where Node APIs are available
      const portFilePath = '../../backend/server-port.txt';
      const port = fs.readFileSync(portFilePath, 'utf8').trim();
      if (port && !isNaN(parseInt(port))) {
        console.log(`Found port in server-port.txt: ${port}`);
        try {
          const response = await axios.get(`http://localhost:${port}/api/health-check`, { 
            timeout: 2000 
          });
          if (response.data && response.data.success) {
            console.log(`Successfully connected using port from file: ${port}`);
            localStorage.setItem('api_port', port);
            return { success: true, port };
          }
        } catch (filePortError) {
          console.log(`Port ${port} from file not responding`);
        }
      }
    } catch (fsError) {
      // File reading failed, which is expected in browser environment
      // Continue with other methods
    }

    // Step 3: Check environment variables (when available in certain environments)
    const envPort = process.env.REACT_APP_API_PORT || process.env.REACT_APP_BACKEND_PORT;
    if (envPort) {
      console.log(`Trying port from environment variables: ${envPort}`);
      try {
        const response = await axios.get(`http://localhost:${envPort}/api/health-check`, { 
          timeout: 2000 
        });
        if (response.data && response.data.success) {
          console.log(`Successfully connected using port from env vars: ${envPort}`);
          localStorage.setItem('api_port', envPort);
          return { success: true, port: envPort };
        }
      } catch (envPortError) {
        console.log(`Port ${envPort} from env vars not responding`);
      }
    }

    // Step 4: Try common ports in order of likelihood
    const commonPorts = [9091, 9090, 9092, 9093, 9094, 9095, 5000, 8080, 3000, 8000];
    
    for (const port of commonPorts) {
      console.log(`Trying common port: ${port}`);
      try {
        const response = await axios.get(`http://localhost:${port}/api/health-check`, { 
          timeout: 1500 // Shorter timeout for port scanning
        });
        
        if (response.data && response.data.success) {
          console.log(`Successfully connected on port: ${port}`);
          localStorage.setItem('api_port', port.toString());
          return { success: true, port: port.toString() };
        }
      } catch (error) {
        // Continue trying other ports
        console.log(`Port ${port} not responding or returned error`);
      }
    }

    // Step 5: Try port scanning as a last resort (a limited range to be efficient)
    console.log('Trying port scan as last resort...');
    // Use a smaller range for better performance
    const startPort = 9080;
    const endPort = 9100; 

    for (let port = startPort; port <= endPort; port++) {
      try {
        console.log(`Scanning port: ${port}`);
        const response = await axios.get(`http://localhost:${port}/api/health-check`, { 
          timeout: 1000 // Very short timeout for scanning
        });
        
        if (response.data && response.data.success) {
          console.log(`Port scan found server on port: ${port}`);
          localStorage.setItem('api_port', port.toString());
          return { success: true, port: port.toString() };
        }
      } catch (error) {
        // Continue scanning
      }
    }

    // If we get here, no working port was found
    console.error('Failed to find a working backend server port');
    return { 
      success: false, 
      error: 'Backend server not found on any expected port' 
    };

  } catch (error) {
    console.error('Error during port detection:', error.message);
    return { 
      success: false, 
      error: `Port detection failed: ${error.message}` 
    };
  }
};

/**
 * Configures global axios defaults for the application
 * Should be called once during app initialization
 */
export const configureAxiosDefaults = () => {
  // Set up global axios defaults
  axios.defaults.timeout = 10000; // 10 seconds default timeout
  
  // Add request interceptor to include auth token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Add response interceptor to handle common errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // Handle specific error status codes
        switch (error.response.status) {
          case 401:
            // Unauthorized - clear auth data and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if in browser environment
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            break;
            
          case 403:
            console.error('Permission denied:', error.response.data);
            break;
            
          case 429:
            console.error('Rate limit exceeded. Please try again later.');
            break;
            
          case 500:
            console.error('Server error:', error.response.data);
            break;
            
          default:
            break;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
};

// Export a function to manually update authorization token
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

const port = fs.readFileSync('backend/server-port.txt', 'utf8').trim();
const axiosInstance = axios.create({
    baseURL: `http://localhost:${port}/api/v1`,
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' }
});

export default axiosInstance;
