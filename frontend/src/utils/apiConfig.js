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

// Add methods to the apiService instance
// Add authorization token to requests
apiService.setAuthToken = (token) => {
  if (token) {
    apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiService.defaults.headers.common['Authorization'];
  }
};

// Health check function - make sure path is correct
apiService.checkHealth = async () => {
  try {
    // Use correct health check endpoint
    const response = await apiService.get('/api/health-check');
    console.log('Health check response:', response.data);
    return { 
      running: true, 
      url: apiService.defaults.baseURL, 
      message: 'Connected to server'
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return { 
      running: false, 
      url: apiService.defaults.baseURL,
      message: `Cannot connect to the backend server. Please check if the server is running.`
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

export default apiService;
