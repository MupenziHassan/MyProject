import api from '../services/api';

/**
 * Initialize application settings on startup
 */
export const initApp = () => {
  // Check for existing auth token and set it in headers if it exists
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Log the API URL being used (helpful for debugging)
  console.log('API URL:', api.defaults.baseURL);
}
