import axios from 'axios';

/**
 * API Connection Utility
 * Provides robust connection handling between frontend and backend
 */
class ApiConnection {
  constructor() {
    this.isConnected = false;
    this.activePort = null;
    this.baseURL = 'http://localhost:9090'; // Default fallback
    this.axiosInstance = axios.create({
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Initialize connection
    this.initConnection();
  }
  
  /**
   * Initialize connection to backend
   */
  async initConnection() {
    try {
      // Try saved port first
      const savedPort = localStorage.getItem('api_port');
      if (savedPort) {
        const connected = await this.tryPort(savedPort);
        if (connected) return;
      }
      
      // Try commonly used ports
      const ports = [9090, 9091, 5000, 3001, 8000, 8080];
      
      for (const port of ports) {
        const connected = await this.tryPort(port);
        if (connected) return;
      }
      
      console.error('Could not connect to backend on any port');
      this.isConnected = false;
    } catch (error) {
      console.error('Connection initialization error:', error);
      this.isConnected = false;
    }
  }
  
  /**
   * Try connecting to a specific port
   */
  async tryPort(port) {
    try {
      const url = `http://localhost:${port}/api/health-check`;
      console.log(`Trying to connect to ${url}`);
      
      const response = await axios.get(url, { timeout: 2000 });
      
      if (response.data && response.data.success) {
        console.log(`Successfully connected to backend on port ${port}`);
        this.baseURL = `http://localhost:${port}`;
        this.activePort = port;
        this.isConnected = true;
        
        // Update axios instance
        this.axiosInstance.defaults.baseURL = this.baseURL;
        
        // Save port for future use
        localStorage.setItem('api_port', port.toString());
        
        return true;
      }
    } catch (error) {
      console.log(`Port ${port} failed:`, error.message);
      return false;
    }
  }
  
  /**
   * Get a new instance of axios with current settings
   */
  getAxiosInstance() {
    return this.axiosInstance;
  }
  
  /**
   * Set auth token for all requests
   */
  setAuthToken(token) {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }
  
  /**
   * Check server health
   */
  async checkHealth() {
    if (!this.isConnected) {
      await this.initConnection();
    }
    
    try {
      const response = await this.axiosInstance.get('/api/health-check');
      return {
        connected: true,
        port: this.activePort,
        details: response.data
      };
    } catch (error) {
      // Try reconnecting once
      await this.initConnection();
      
      return {
        connected: this.isConnected,
        port: this.activePort,
        error: error.message
      };
    }
  }
  
  /**
   * Make requests with automatic reconnection
   */
  async request(method, url, data = null, config = {}) {
    if (!this.isConnected) {
      await this.initConnection();
      
      if (!this.isConnected) {
        throw new Error('Unable to connect to backend server');
      }
    }
    
    try {
      const response = await this.axiosInstance.request({
        method,
        url,
        data: method !== 'get' ? data : undefined,
        params: method === 'get' ? data : undefined,
        ...config
      });
      
      return response.data;
    } catch (error) {
      // If connection error, try reconnecting
      if (!error.response) {
        await this.initConnection();
        
        // Retry request once
        try {
          const retryResponse = await this.axiosInstance.request({
            method,
            url,
            data: method !== 'get' ? data : undefined,
            params: method === 'get' ? data : undefined,
            ...config
          });
          
          return retryResponse.data;
        } catch (retryError) {
          throw retryError;
        }
      }
      
      throw error;
    }
  }
  
  // Convenience methods
  async get(url, params, config) {
    return this.request('get', url, params, config);
  }
  
  async post(url, data, config) {
    return this.request('post', url, data, config);
  }
  
  async put(url, data, config) {
    return this.request('put', url, data, config);
  }
  
  async delete(url, config) {
    return this.request('delete', url, null, config);
  }
}

// Create and export singleton instance
const apiConnection = new ApiConnection();
export default apiConnection;
