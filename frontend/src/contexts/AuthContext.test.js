import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  });

  it('initializes with null user and loading state', () => {
    // Create a test component that consumes the context
    const TestComponent = () => {
      const { currentUser, loading } = React.useContext(AuthContext);
      return (
        <div>
          <div data-testid="loading">{loading.toString()}</div>
          <div data-testid="user">{JSON.stringify(currentUser)}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('loads user from token in localStorage', async () => {
    // Mock localStorage token
    localStorage.setItem('token', 'fake-token');
    
    // Mock API response for user data
    const mockUserData = { name: 'Test User', email: 'test@example.com', role: 'patient' };
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockUserData
      }
    });

    // Create a test component
    const TestComponent = () => {
      const { currentUser, loading } = React.useContext(AuthContext);
      return (
        <div>
          <div data-testid="loading">{loading.toString()}</div>
          <div data-testid="user">{currentUser ? JSON.stringify(currentUser) : 'null'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for the user to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(JSON.parse(screen.getByTestId('user').textContent)).toEqual(mockUserData);
    });

    // Check that axios was called with the token
    expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/me');
    expect(axios.defaults.headers.common['Authorization']).toBe('Bearer fake-token');
  });

  // More tests for login, logout, etc.
});
