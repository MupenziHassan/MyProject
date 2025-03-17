import api from '../services/api';
import axios from 'axios';

class ConnectionTester {
  constructor() {
    this.baseURL = api.defaults.baseURL || '';
    this.lastConnectionTest = null;
    this.connectionStatus = {
      connected: false,
      serverInfo: null,
      lastChecked: null,
      error: null
    };
  }

  /**
   * Test connection to backend
   */
  async testConnection() {
    // Don't test too frequently
    if (this.lastConnectionTest && Date.now() - this.lastConnectionTest < 10000) {
      return this.connectionStatus;
    }

    this.lastConnectionTest = Date.now();
    this.connectionStatus.lastChecked = new Date().toISOString();

    try {
      // Try health-check endpoint
      const response = await api.get('/api/health-check');
      
      this.connectionStatus = {
        connected: true,
        serverInfo: {
          ...response.data,
          endpoint: '/api/health-check'
        },
        lastChecked: new Date().toISOString(),
        error: null
      };

      return this.connectionStatus;
    } catch (error) {
      // Try alternative endpoints
      try {
        const altResponse = await api.get('/api/v1');
        
        this.connectionStatus = {
          connected: true,
          serverInfo: {
            ...altResponse.data,
            endpoint: '/api/v1'
          },
          lastChecked: new Date().toISOString(),
          error: null
        };

        return this.connectionStatus;
      } catch (altError) {
        this.connectionStatus = {
          connected: false,
          serverInfo: null,
          lastChecked: new Date().toISOString(),
          error: {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          }
        };

        return this.connectionStatus;
      }
    }
  }

  /**
   * Test login with credentials
   */
  async testLogin(email, password) {
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }
  }
}

/**
 * Tests connection to backend with multiple endpoints
 */
export const testBackendConnection = async () => {
  console.log('Running backend connection test...');
  const ports = [9090, 9091, 9092, 9093, 9094, 9095, 5000, 8000, 3001];
  const results = [];
  
  // First try health-check endpoint
  for (const port of ports) {
    try {
      console.log(`Testing connection on port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/api/health-check`, {
        timeout: 2000
      });
      
      console.log(`✅ Connection successful on port ${port}!`);
      results.push({
        port,
        success: true,
        data: response.data,
        endpoint: '/api/health-check'
      });
      
      // Save the working port to localStorage
      localStorage.setItem('api_port', port.toString());
      break;
    } catch (error) {
      console.log(`❌ Port ${port} failed with: ${error.message}`);
      results.push({
        port,
        success: false,
        error: error.message
      });
    }
  }
  
  // Check if any connection was successful
  const successfulConnection = results.find(r => r.success);
  
  if (successfulConnection) {
    return {
      success: true,
      port: successfulConnection.port,
      data: successfulConnection.data,
      allResults: results
    };
  }
  
  // If health-check failed, try other endpoints with the first port
  try {
    console.log('Trying root endpoint...');
    const rootResponse = await axios.get(`http://localhost:9090/`);
    
    return {
      success: true,
      port: 9090,
      data: rootResponse.data,
      endpoint: '/',
      allResults: results
    };
  } catch (error) {
    console.error('All connection attempts failed!');
    return {
      success: false,
      error: 'Could not connect to backend on any port or endpoint',
      allResults: results
    };
  }
};

/**
 * Tests login functionality
 */
export const testLogin = async (email, password) => {
  try {
    const port = localStorage.getItem('api_port') || '9090';
    console.log(`Testing login on port ${port}...`);
    
    const response = await axios.post(`http://localhost:${port}/api/v1/auth/login`, {
      email,
      password
    });
    
    return {
      success: true,
      token: response.data.token,
      user: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      response: error.response?.data
    };
  }
};

// Create singleton instance
const connectionTester = new ConnectionTester();
export default connectionTester;
