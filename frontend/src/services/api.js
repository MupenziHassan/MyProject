import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration and other common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and we haven't tried refreshing the token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Implementation for token refresh would go here in a real app
      // For now, just redirect to login
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper methods
const apiService = {
  setAuthToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  removeAuthToken: () => {
    localStorage.removeItem('token');
  },
  
  // API call methods
  get: async (url, config = {}) => {
    return api.get(url, config);
  },
  
  post: async (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },
  
  put: async (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },
  
  delete: async (url, config = {}) => {
    return api.delete(url, config);
  }
};

export default apiService;