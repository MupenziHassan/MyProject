import React, { createContext, useState, useEffect } from 'react';
import apiService from '../utils/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      setCurrentUser(JSON.parse(user));
      apiService.setAuthToken(token);
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setAuthError(null);
      console.log('Attempting login with:', credentials.email);
      
      // Use the enhanced loginUser function that tries multiple ports
      const response = await apiService.loginUser(credentials);
      console.log('Login response received:', response.data);
      
      if (response?.data?.success && response?.data?.token) {
        const { token, data } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        
        // Set auth token in API service
        apiService.setAuthToken(token);
        
        // Update current user state
        setCurrentUser(data);
        
        return { success: true };
      } else if (response?.data?.token) {
        // Some APIs might just return token without a success flag
        const token = response.data.token;
        const userData = response.data.data || response.data.user || { 
          id: response.data.id || 'unknown',
          email: credentials.email 
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        apiService.setAuthToken(token);
        setCurrentUser(userData);
        
        return { success: true };
      } else {
        console.warn('Invalid login response format:', response.data);
        return { 
          success: false, 
          error: 'Invalid response from server. Please check server logs.' 
        };
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      // Provide more helpful error messages
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
        setAuthError(errorMessage);
        return { success: false, error: errorMessage };
      } else if (error.request) {
        // No response received - this might be due to server not running
        setAuthError('No response from server. Please check if backend server is running.');
        return { 
          success: false, 
          error: 'No response from server. Please check if backend server is running.' 
        };
      } else {
        // Request setup error
        const errorMessage = error.message || 'Login failed. Please try again.';
        setAuthError(errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiService.setAuthToken(null);
    setCurrentUser(null);
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      
      // Try with current baseURL first
      try {
        const response = await apiService.post('/api/v1/auth/register', userData);
        setRegistrationSuccess(true);
        return { success: true, message: 'Registration successful! You can now log in.' };
      } catch (initialError) {
        // If it's a connection error, try multiple ports
        if (!initialError.response) {
          try {
            const response = await apiService.tryMultiplePorts('/api/v1/auth/register', {
              method: 'post',
              data: userData,
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000
            });
            setRegistrationSuccess(true);
            return { success: true, message: 'Registration successful! You can now log in.' };
          } catch (portError) {
            throw portError;
          }
        } else {
          throw initialError;
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    registrationSuccess,
    setRegistrationSuccess,
    authError,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
