import { createContext } from 'react';

// Initialize with default values to prevent undefined errors
export const AuthContext = createContext({
  auth: {
    isAuthenticated: false,
    user: null,
    role: null
  },
  setAuth: () => {}
});
