import axios from 'axios';

const setAuthToken = (token) => {
  if (token) {
    // Apply authorization token to every request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Save token to localStorage
    localStorage.setItem('token', token);
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization'];
    // Remove token from localStorage
    localStorage.removeItem('token');
  }
};

export default setAuthToken;
