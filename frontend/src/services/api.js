import axios from 'axios';

// Create base axios instance
class Api {
  constructor() {
    // Default configuration
    this.baseURL = 'http://localhost:5000';
    this.timeout = 5000;
    this.isInitialized = false;
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Initialize automatically
    this.initialize();
  }
  
  // Initialize API with port detection
  async initialize() {
    // Skip if already initialized
    if (this.isInitialized) return;
    
    try {
      // Try to detect server port
      const port = await this.detectPort();
      if (port) {
        this.baseURL = `http://localhost:${port}`;
        this.client.defaults.baseURL = this.baseURL;
      }
      
      // Restore auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        this.setAuthToken(token);
      }
      
      this.isInitialized = true;
      console.log('API service initialized with baseURL:', this.baseURL);
    } catch (error) {
      console.error('Error initializing API service:', error);
    }
  }
  
  // Add the checkServer method
  async checkServer() {
    const port = await this.detectPort();
    
    if (port) {
      return { 
        success: true, 
        port,
        message: `Connected to server on port ${port}`
      };
    }
    
    return { 
      success: false,
      message: 'Could not connect to server on any port'
    };
  }
  
  // Add the checkHealth method
  async checkHealth() {
    await this.initialize();
    
    try {
      const response = await this.client.get('/api/health-check', { timeout: 3000 });
      
      return {
        running: true,
        message: 'Connected to server',
        port: new URL(this.baseURL).port,
        url: this.baseURL,
        data: response.data
      };
    } catch (error) {
      console.log('Health check failed, trying to reconnect...');
      
      // Try to find a working port
      const port = await this.detectPort();
      
      if (port) {
        // Successfully found a working port
        return {
          running: true,
          message: 'Connected to server on alternate port',
          port: port,
          url: `http://localhost:${port}`
        };
      }
      
      // All connection attempts failed
      return {
        running: false,
        message: 'Cannot connect to server. Please make sure the backend is running.',
        url: this.baseURL
      };
    }
  }
  
  // Detect backend server port
  async detectPort() {
    // Check if we have a saved port
    const savedPort = localStorage.getItem('api_port');
    if (savedPort) {
      try {
        // Verify saved port works
        await axios.get(`http://localhost:${savedPort}/api/health-check`, { timeout: 2000 });
        return savedPort;
      } catch (error) {
        // Saved port not working, continue to port scanning
      }
    }
    
    // Try common ports
    const ports = [5000, 5001, 5002, 9090, 9091, 8000, 3000];
    
    for (const port of ports) {
      try {
        const response = await axios.get(`http://localhost:${port}/api/health-check`, { timeout: 2000 });
        
        // Fix the unused variable warning by using the response
        if (response.data && response.data.success) {
          // Port works! Save and use it
          localStorage.setItem('api_port', port.toString());
          return port;
        }
      } catch (error) {
        // Try next port
      }
    }
    
    // No working port found, use default
    return null;
  }
  
  // Set auth token for authenticated requests
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }
  
  // Authentication methods
  async login(credentials) {
    await this.initialize();
    const response = await this.client.post('/api/v1/auth/login', credentials);
    return response.data;
  }
  
  async register(userData) {
    await this.initialize();
    const response = await this.client.post('/api/v1/auth/register', userData);
    return response.data;
  }
  
  // Data fetching methods - these will use the real database
  async getPatients() {
    await this.initialize();
    const response = await this.client.get('/api/v1/patients');
    return response.data;
  }
  
  async getDoctors() {
    await this.initialize();
    const response = await this.client.get('/api/v1/doctors');
    return response.data;
  }
  
  async getPredictions(patientId) {
    await this.initialize();
    const response = await this.client.get(`/api/v1/predictions${patientId ? `/${patientId}` : ''}`);
    return response.data;
  }
  
  async createPrediction(data) {
    await this.initialize();
    const response = await this.client.post('/api/v1/predictions', data);
    return response.data;
  }
  
  async getAppointments() {
    await this.initialize();
    const response = await this.client.get('/api/v1/appointments');
    return response.data;
  }
  
  async createAppointment(data) {
    await this.initialize();
    const response = await this.client.post('/api/v1/appointments', data);
    return response.data;
  }
  
  // Generic request methods with automatic reconnection
  async get(endpoint, params) {
    await this.initialize();
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async post(endpoint, data) {
    await this.initialize();
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async put(endpoint, data) {
    await this.initialize();
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async delete(endpoint) {
    await this.initialize();
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  // Error handling
  handleError(error) {
    if (!error.response) {
      // Network error - server might have changed ports
      this.isInitialized = false;
      this.initialize();
    }
  }
}

// Export singleton instance
const api = new Api();
export default api;