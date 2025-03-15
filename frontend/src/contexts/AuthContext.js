import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

// Create context
export const AuthContext = createContext();

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  currentUser: null,
  isAuthenticated: null,
  loading: true,
  error: null
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        currentUser: action.payload
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        currentUser: null,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }

      try {
        const res = await axios.get('/api/v1/auth/me');

        dispatch({
          type: 'USER_LOADED',
          payload: res.data.data
        });
      } catch (err) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: err.response?.data?.error || 'Authentication error'
        });
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/v1/auth/register', formData);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });

      return true;
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.error || 'Registration failed'
      });
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/v1/auth/login', {
        email,
        password
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      return true;
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.error || 'Invalid credentials'
      });
      return false;
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear Errors
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/v1/auth/forgotpassword', { email });
      clearError();
      return true;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.error || 'Password reset failed'
      });
      return false;
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    try {
      await axios.put(`/api/v1/auth/resetpassword/${resetToken}`, {
        password
      });
      clearError();
      return true;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.error || 'Password reset failed'
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        clearError,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
