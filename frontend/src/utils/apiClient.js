import axios from 'axios';
import authHeader from '../services/authHeader';

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth headers
apiClient.interceptors.request.use(
  (config) => {
    // Add auth headers to every request
    const headers = authHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for retries
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Skip retry for specific status codes
    if (!response || response.status !== 429 || config.__isRetry) {
      return Promise.reject(error);
    }

    // Set retry flag
    config.__isRetry = true;
    
    // Wait for a short time before retrying
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Retry the request
    return apiClient(config);
  }
);

export default apiClient;
