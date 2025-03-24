import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Test users for development
const TEST_USERS = [
  {
    id: 'test-patient-id',
    email: 'patient@example.com',
    password: 'patient123',
    role: 'patient',
    name: 'Test Patient',
    profile: { /* patient profile data */ }
  },
  {
    id: 'test-doctor-id',
    email: 'doctor@example.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Test Doctor',
    profile: { /* doctor profile data */ }
  },
  {
    id: 'test-admin-id',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    name: 'Test Admin',
    profile: { /* admin profile data */ }
  }
];

const UserService = {
  // Get a test user by role
  getTestUserByRole: async (role) => {
    return TEST_USERS.find(user => user.role === role);
  },
  
  // Login user - first try database, fall back to test users
  login: async (email, password) => {
    try {
      // First check for test users in development environment
      const testUser = TEST_USERS.find(user => 
        user.email === email && user.password === password
      );
      
      if (testUser) {
        console.log('Logging in with test user:', testUser.email);
        return {
          user: { ...testUser },
          token: `test-token-${testUser.role}`,
        };
      }
      
      // If not a test user, try the real API
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // If API call failed but not because of auth (e.g., server down)
      if (!error.response || error.response.status !== 401) {
        throw new Error('Could not connect to the server. Please try again later.');
      }
      
      // If credentials were invalid
      throw new Error('Invalid email or password');
    }
  },
  
  // Register a new user
  register: async (userData) => {
    // Check if attempting to register a test user
    if (['patient@example.com', 'doctor@example.com', 'admin@example.com'].includes(userData.email)) {
      throw new Error('Cannot register with test user email addresses');
    }
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      // Check if the error response is not JSON
      if (error.response && error.response.headers['content-type'] && 
          !error.response.headers['content-type'].includes('application/json')) {
        console.error('Non-JSON error response:', error.response.data);
        throw new Error('Server returned an invalid response. Please try again later.');
      }
      throw error;
    }
  },
  
  // Get user data - first try database, fall back to test users
  getUserData: async (userId, token) => {
    try {
      // Try to get user data from the real API
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      // If token starts with "test-token", it's a test user
      if (token && token.startsWith('test-token')) {
        const role = token.split('-')[2];
        const testUser = TEST_USERS.find(user => user.role === role);
        if (testUser) {
          return { user: testUser };
        }
      }
      
      // If no test user matches or not a test token, propagate error
      throw error;
    }
  },
  
  // Get all users (for admin)
  getAllUsers: async (token) => {
    // If using test admin token, return all test users
    if (token === 'test-token-admin') {
      return { users: TEST_USERS };
    }
    
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Get doctors (for appointment scheduling)
  getDoctors: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/doctors`);
      return response.data;
    } catch (error) {
      // Fall back to test doctor if API fails
      return { doctors: [TEST_USERS.find(user => user.role === 'doctor')] };
    }
  },
  
  // Get patients (for doctors)
  getPatients: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      // Fall back to test patient if using test doctor token
      if (token === 'test-token-doctor') {
        return { patients: [TEST_USERS.find(user => user.role === 'patient')] };
      }
      throw error;
    }
  }
};

export default UserService;
