import React, { createContext, useState, useEffect, useContext } from 'react';
import UserService from '../services/UserService';

// Create and export the context
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // For test tokens, extract the role
          if (token.startsWith('test-token-')) {
            const role = token.split('-')[2];
            // Find the test user with this role
            const testUser = await UserService.getTestUserByRole(role);
            if (testUser) {
              setCurrentUser(testUser);
            } else {
              // Invalid test token
              localStorage.removeItem('authToken');
              setToken(null);
            }
          } else {
            // Real token - get user data from API
            const userData = await UserService.getUserData('current', token);
            if (userData && userData.user) {
              setCurrentUser(userData.user);
            } else {
              localStorage.removeItem('authToken');
              setToken(null);
            }
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('authToken');
          setToken(null);
          setError('Session expired. Please log in again.');
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await UserService.login(email, password);
      
      if (response && response.token) {
        localStorage.setItem('authToken', response.token);
        setToken(response.token);
        setCurrentUser(response.user);
        setError(null);
        return response.user;
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await UserService.register(userData);
      
      if (response && response.success) {
        // Automatically log in after successful registration
        return await login(userData.email, userData.password);
      } else {
        throw new Error(response?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
