import axios from 'axios';

// Register user
export const register = async (userData) => {
  try {
    const response = await axios.post('/api/v1/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Server error' };
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await axios.post('/api/v1/auth/login', { email, password });
    
    // Store token in local storage
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Server error' };
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get auth header
export const authHeader = () => {
  const user = getCurrentUser();
  
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
};
