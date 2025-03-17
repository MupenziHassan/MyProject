import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../utils/apiConfig';

// Create context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user and token on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        apiService.setAuthToken(token);
      } catch (e) {
        console.error('Error parsing stored user', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.request(() => 
        apiService.auth.login(credentials)
      );
      
      if (response.success) {
        setCurrentUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        apiService.setAuthToken(response.data.token);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.request(() => 
        apiService.auth.register(userData)
      );
      
      if (response.success) {
        // Optionally auto-login after registration
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiService.removeAuthToken();
    // Use plain DOM navigation instead of React Router's navigate
    window.location.href = '/login';
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
