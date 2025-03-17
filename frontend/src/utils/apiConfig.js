import axios from 'axios';

// Create a base API instance with initial configuration
const apiService = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 seconds timeout
});

// Method to update the base URL when the port is determined
apiService.updateBaseURL = function(baseURL) {
  this.defaults.baseURL = baseURL;
  console.log('API baseURL updated to:', baseURL);
};

// Initialize with a default that will be updated
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9091';
apiService.defaults.baseURL = API_BASE_URL;
console.log('API initially connecting to:', API_BASE_URL);

// Try multiple backend ports if the primary one fails
apiService.tryMultiplePorts = async function(endpoint, options = {}) {
  const ports = [9091, 9090, 9092, 9093, 5000, 8000, 3000];
  let lastError = null;
  
  for (let port of ports) {
    try {
      console.log(`Trying ${endpoint} on port ${port}...`);
      const tempBaseURL = `http://localhost:${port}`;
      const response = await axios({
        ...options,
        url: `${tempBaseURL}${endpoint}`,
        timeout: options.timeout || 3000
      });
      
      // If successful, update the baseURL for future requests
      this.updateBaseURL(tempBaseURL);
      localStorage.setItem('api_port', port.toString());
      console.log(`Connection successful on port ${port}`);
      return response;
    } catch (error) {
      lastError = error;
      console.log(`Port ${port} failed: ${error.message}`);
      // Continue to next port
    }
  }
  
  throw lastError || new Error('Failed to connect to backend on any port');
};

// Add authorization token to requests
apiService.setAuthToken = (token) => {
  if (token) {
    apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiService.defaults.headers.common['Authorization'];
  }
};

// Health check function with multi-port fallback
apiService.checkHealth = async () => {
  try {
    // Try with current baseURL first
    try {
      const response = await apiService.get('/api/health-check', { timeout: 3000 });
      return { 
        running: true, 
        url: apiService.defaults.baseURL, 
        message: 'Connected to server'
      };
    } catch (initialError) {
      // Try all ports
      try {
        await apiService.tryMultiplePorts('/api/health-check', { method: 'get' });
        return { 
          running: true, 
          url: apiService.defaults.baseURL, 
          message: 'Connected to server (alternate port)'
        };
      } catch (allPortsError) {
        // All attempts failed
        return { 
          running: false, 
          url: apiService.defaults.baseURL,
          message: `Cannot connect to backend server. The server might not be running.`
        };
      }
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return { 
      running: false, 
      url: apiService.defaults.baseURL,
      message: `Connection error: ${error.message}`
    };
  }
};

// Generic request handler with retries
apiService.request = async (requestFn, maxRetries = 2) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.warn(`Request timeout, attempt ${attempt + 1} of ${maxRetries + 1}`);
      } else if (error.response?.status >= 500) {
        console.warn(`Server error ${error.response.status}, attempt ${attempt + 1} of ${maxRetries + 1}`);
      } else {
        // Don't retry client errors or network errors
        throw error;
      }
    }
  }
  throw lastError;
};

// Enhanced login function that tries multiple strategies
apiService.loginUser = async (credentials) => {
  // First try with the configured baseURL
  try {
    const response = await apiService.post('/api/v1/auth/login', credentials);
    return response;
  } catch (error) {
    // If it's a connection error, try multiple ports
    if (!error.response) {
      try {
        return await apiService.tryMultiplePorts('/api/v1/auth/login', {
          method: 'post',
          data: credentials,
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        });
      } catch (portError) {
        console.error('All login attempts failed:', portError);
        throw portError;
      }
    } else {
      // If we got a response but it's an error, throw it
      throw error;
    }
  }
};

export default apiService;
