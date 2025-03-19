import axios from 'axios';

// Constants for API configuration
const DEFAULT_PORTS = [9090, 9091, 9092, 9093, 9094, 9095, 5000, 8000, 3000];
const DEFAULT_TIMEOUT = 3000; // 3 seconds

export const setupAxios = async () => {
  try {
    const cachedPort = localStorage.getItem('api_port');
    
    // Step 1: Try cached port first
    if (cachedPort) {
      try {
        console.log(`Trying cached port: ${cachedPort}`);
        const response = await axios.get(`http://localhost:${cachedPort}/api/health-check`, { 
          timeout: DEFAULT_TIMEOUT 
        });
        
        if (response.data && response.data.success) {
          console.log(`Successfully connected using cached port: ${cachedPort}`);
          return { success: true, port: cachedPort };
        }
      } catch (cachedError) {
        console.log(`Cached port ${cachedPort} failed:`, cachedError.message);
        // Continue to other methods if cached port fails
      }
    }

    // Remove the file reading approach, as it doesn't work in browser
    // Instead, use a more browser-friendly approach:
    
    // Step 2: Try to check known port ranges
    console.log('Trying default ports...');
    for (const port of DEFAULT_PORTS) {
      try {
        console.log(`Trying port ${port}...`);
        const response = await axios.get(`http://localhost:${port}/api/health-check`, { 
          timeout: DEFAULT_TIMEOUT 
        });
        
        if (response.data && response.data.success) {
          console.log(`Successfully connected on port ${port}`);
          localStorage.setItem('api_port', port.toString());
          return { success: true, port };
        }
      } catch (error) {
        // Just skip failed ports
      }
    }

    // If we get here, all connection attempts failed
    return { 
      success: false, 
      error: 'Could not connect to backend server on any port.' 
    };
  } catch (error) {
    console.error('Error in setupAxios:', error);
    return {
      success: false,
      error: `Setup error: ${error.message}`
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

const axiosInstance = axios.create({
    baseURL: `http://localhost:${DEFAULT_PORTS[0]}/api/v1`,
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' }
});

export default axiosInstance;
