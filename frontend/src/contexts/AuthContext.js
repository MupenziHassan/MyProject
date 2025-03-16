import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (via token)
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get('/api/v1/auth/me');
          setCurrentUser(res.data.data);
        } catch (err) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5001/api/v1/auth/login', { email, password });
      
      // Set token in local storage
      localStorage.setItem('token', res.data.token);
      
      // Set token in auth header
      setAuthToken(res.data.token);
      
      // Set user in state
      setCurrentUser(res.data.data);
      
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    // Remove token
    localStorage.removeItem('token');
    setAuthToken(null);
    setCurrentUser(null);
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/v1/auth/register', userData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      error, 
      login, 
      logout, 
      register, 
      setCurrentUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
