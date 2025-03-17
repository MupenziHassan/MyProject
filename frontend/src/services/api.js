import axios from 'axios';

// Get the backend port from localStorage if available
const getBaseURL = () => {
  const port = localStorage.getItem('api_port') || '9090';
  return `http://localhost:${port}`;
};

// Create API instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to update baseURL if port changes
api.interceptors.request.use(
  config => {
    config.baseURL = getBaseURL();
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with an error status code
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Redirect to login page in a real implementation
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('API Error: No response received', error.request);
    } else {
      // Error setting up the request
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper to set auth token
api.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export default api;