import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Add state for auth to fix the 'setAuth is not defined' errors
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    role: null
  });

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userJson && token) {
      try {
        const userData = JSON.parse(userJson);
        const user = userData.user || userData; // Handle both formats
        
        // Set user data
        setCurrentUser(user);
        
        // Set authentication status
        setAuth({
          isAuthenticated: true,
          user: user,
          role: user.role
        });
        
        // Set API token
        api.setAuthToken(token);
        
        console.log('User restored from localStorage:', user.role);
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []); // Remove setAuth from dependencies

  const login = async (credentials) => {
    try {
      setAuthError(null);
      
      const response = await api.login(credentials);
      
      if (response && response.success) {
        // Get user data (handle both formats)
        const userData = response.data || {};
        const user = userData.user || userData;
        
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set auth token in API service
        api.setAuthToken(response.token);
        
        // Update current user state
        setCurrentUser(user);
        
        // Update auth context
        setAuth({
          isAuthenticated: true,
          user: user,
          role: user.role
        });
        
        return { success: true, role: user.role };
      } else {
        // Handle unexpected response format
        return { 
          success: false, 
          error: 'Invalid response from server.'
        };
      }
    } catch (error) {
      setAuthError(error.message || 'An error occurred during login');
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  async function register(userData) {
    try {
      setAuthError(null);
      console.log('Attempting registration for:', userData.email);
      
      const registerResponse = await api.register(userData);
      
      // Fix the unused variable warning by using registerResponse
      if (registerResponse && registerResponse.success) {
        return { success: true };
      } else {
        // Handle unexpected response format
        return { 
          success: false, 
          error: 'Invalid response from server.'
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth token from API service
    api.setAuthToken(null);
    
    // Reset auth state
    setCurrentUser(null);
    setAuth({
      isAuthenticated: false,
      user: null,
      role: null
    });
  };

  const value = {
    currentUser,
    auth,  // Include auth state in the context value
    authError,
    login,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
