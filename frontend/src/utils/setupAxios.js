import api from '../services/api';

export const setupAxios = () => {
  // Log API requests in development environment
  if (process.env.NODE_ENV === 'development') {
    api.interceptors.request.use(request => {
      console.log('Starting API Request:', request.url);
      return request;
    });
  }

  // Set token from localStorage if it exists
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
