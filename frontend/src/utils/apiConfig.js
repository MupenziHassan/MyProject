import axios from 'axios';

// Create a simplified API service
const apiService = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000
});

// Get base URL with port fallback mechanism
const getBaseUrl = () => {
  // Try to get from localStorage if previously saved
  const savedPort = localStorage.getItem('api_port');
  return savedPort 
    ? `http://localhost:${savedPort}` 
    : 'http://localhost:9090';
};

// Set initial base URL
apiService.defaults.baseURL = getBaseUrl();
console.log('API initially connecting to:', apiService.defaults.baseURL);

// Method for use in App.js
apiService.setupBaseUrl = async function() {
  const baseUrl = getBaseUrl();
  this.defaults.baseURL = baseUrl;
  
  // Try to detect working port in background
  this.detectPort();
  
  return baseUrl;
};

// Method to detect working server port
apiService.detectPort = async function() {
  const ports = [9090, 9091, 9092, 9093, 5000, 3001];
  
  for (const port of ports) {
    try {
      const url = `http://localhost:${port}/api/health-check`;
      const response = await axios.get(url, { timeout: 2000 });
      
      if (response.data && response.data.success) {
        // Save and update working port
        localStorage.setItem('api_port', port.toString());
        this.defaults.baseURL = `http://localhost:${port}`;
        console.log(`Connected to backend on port ${port}`);
        return { success: true, port };
      }
    } catch (err) {
      // Continue to next port
    }
  }
  
  return { success: false };
};

// Authentication token management
apiService.setAuthToken = function(token) {
  if (token) {
    this.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete this.defaults.headers.common['Authorization'];
  }
};

// Add health check function for ConnectionErrorHandler compatibility
apiService.checkHealth = async function() {
  try {
    // Try with current baseURL first
    try {
      const response = await this.get('/api/health-check', { timeout: 3000 });
      return { 
        running: true, 
        url: this.defaults.baseURL, 
        message: 'Connected to server',
        port: response.data.port || new URL(this.defaults.baseURL).port
      };
    } catch (initialError) {
      console.log('Health check failed on initial URL, trying all ports');
      // Try to find a working port
      const portCheck = await this.detectPort();
      
      if (portCheck.success) {
        return { 
          running: true, 
          url: this.defaults.baseURL, 
          message: 'Connected to server (alternate port)',
          port: portCheck.port
        };
      } else {
        return { 
          running: false, 
          url: this.defaults.baseURL,
          message: `Cannot connect to backend server. The server might not be running.`
        };
      }
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return { 
      running: false, 
      url: this.defaults.baseURL,
      message: `Connection error: ${error.message}`
    };
  }
};

export default apiService;
