import axios from 'axios';

/**
 * API Connection Utility
 * Provides robust connection handling between frontend and backend MongoDB API
 */
class ApiConnection {
  constructor() {
    this.isConnected = false;
    this.activePort = null;
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:9090'; // Default fallback
    this.apiVersion = '/api/v1';
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
    
    this.axiosInstance = axios.create({
      timeout: 10000,
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
      this.connectionAttempts++;
      console.log(`Attempting to connect to backend (Attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})`);
      
      // On login page, we'll be more silent about connection issues
      const isLoginPage = window.location.pathname === '/login' || 
                          window.location.pathname === '/register' ||
                          window.location.pathname === '/';
      
      // Try saved port from localStorage first as it's most likely correct
      const savedPort = localStorage.getItem('api_port');
      if (savedPort) {
        const connected = await this.tryPort(savedPort);
        if (connected) return;
      }
      
      // Try to read server-port.txt first if available
      try {
        const portResponse = await axios.get('/server-port.txt', { timeout: 1000 });
        if (portResponse.data && !isNaN(parseInt(portResponse.data))) {
          const port = parseInt(portResponse.data);
          console.log(`Found server port file with port: ${port}`);
          const connected = await this.tryPort(port);
          if (connected) return;
        }
      } catch (err) {
        // Ignore error and continue with other methods
      }
      
      // Try commonly used ports
      const ports = [9090, 9091, 5000, 3001, 8000, 8080];
      
      for (const port of ports) {
        const connected = await this.tryPort(port);
        if (connected) return;
      }
      
      console.warn('Could not connect to backend on any port');
      this.isConnected = false;
      
      // Don't retry connection on login/register page to avoid overwhelming console
      if (!isLoginPage && this.connectionAttempts < this.maxConnectionAttempts) {
        console.log(`Retrying connection in 3 seconds...`);
        setTimeout(() => this.initConnection(), 3000);
      } else {
        this.dispatchConnectionEvent(false);
      }
      
    } catch (error) {
      console.warn('Connection initialization error:', error.message);
      this.isConnected = false;
      this.dispatchConnectionEvent(false);
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
        this.connectionAttempts = 0;
        
        // Update axios instance
        this.axiosInstance.defaults.baseURL = this.baseURL + this.apiVersion;
        
        // Save port for future use
        localStorage.setItem('api_port', port.toString());
        
        // Also save the database status
        if (response.data.dbStatus) {
          localStorage.setItem('db_status', response.data.dbStatus);
        }
        
        // Dispatch a custom event that components can listen for
        this.dispatchConnectionEvent(true);
        
        return true;
      }
    } catch (error) {
      console.log(`Port ${port} failed:`, error.message);
      return false;
    }
  }
  
  /**
   * Dispatch a custom event when connection status changes
   */
  dispatchConnectionEvent(connected) {
    const event = new CustomEvent('api-connection-changed', {
      detail: {
        connected,
        port: this.activePort,
        baseURL: this.baseURL
      }
    });
    window.dispatchEvent(event);
  }
  
  /**
   * Get database status
   */
  getDatabaseStatus() {
    return localStorage.getItem('db_status') || 'unknown';
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
      localStorage.setItem('auth_token', token);
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
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
      const response = await this.axiosInstance.get('/health-check');
      return {
        connected: true,
        port: this.activePort,
        details: response.data,
        database: response.data.dbStatus || 'unknown'
      };
    } catch (error) {
      // Try reconnecting once
      await this.initConnection();
      
      return {
        connected: this.isConnected,
        port: this.activePort,
        error: error.message,
        database: 'unknown'
      };
    }
  }
  
  /**
   * Make API requests with automatic reconnection but not on login page
   */
  async request(method, endpoint, data = null, config = {}) {
    const isLoginPage = window.location.pathname === '/login' || 
                        window.location.pathname === '/register' ||
                        window.location.pathname === '/';
                        
    // On login page, try to connect but don't retry or show errors
    if (!this.isConnected) {
      if (!isLoginPage) {
        await this.initConnection();
        
        if (!this.isConnected) {
          throw new Error('Unable to connect to backend server');
        }
      } else {
        // Just try once silently on login page
        try {
          await this.initConnection();
        } catch (e) {
          // Suppress errors on login page
        }
      }
    }
    
    try {
      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        data: method !== 'get' ? data : undefined,
        params: method === 'get' ? data : undefined,
        ...config
      });
      
      return response.data;
    } catch (error) {
      // If connection error, try reconnecting (but not on login page)
      if (!error.response && !isLoginPage) {
        console.warn('Network error while making request:', error.message);
        await this.initConnection();
        
        // Retry request once
        try {
          const retryResponse = await this.axiosInstance.request({
            method,
            url: endpoint,
            data: method !== 'get' ? data : undefined,
            params: method === 'get' ? data : undefined,
            ...config
          });
          
          return retryResponse.data;
        } catch (retryError) {
          this.handleApiError(retryError, endpoint);
          throw retryError;
        }
      }
      
      // Don't log errors on login page to keep console clean
      if (!isLoginPage) {
        this.handleApiError(error, endpoint);
      }
      throw error;
    }
  }
  
  /**
   * Handle common API errors
   */
  handleApiError(error, endpoint) {
    if (error.response) {
      // Server responded with non-2xx status
      const status = error.response.status;
      
      switch (status) {
        case 401:
          console.error(`Unauthorized access to ${endpoint}. Token may be invalid or expired.`);
          // Could trigger logout here if needed
          break;
          
        case 403:
          console.error(`Forbidden access to ${endpoint}. Insufficient permissions.`);
          break;
          
        case 404:
          console.error(`Resource not found: ${endpoint}`);
          break;
          
        case 500:
          console.error(`Server error when accessing ${endpoint}:`, error.response.data);
          break;
          
        default:
          console.error(`API error (${status}) when accessing ${endpoint}:`, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(`No response received for ${endpoint}:`, error.message);
    } else {
      // Error in setting up the request
      console.error(`Error setting up request to ${endpoint}:`, error.message);
    }
  }
  
  // Convenience methods
  async get(endpoint, params, config) {
    return this.request('get', endpoint, params, config);
  }
  
  async post(endpoint, data, config) {
    return this.request('post', endpoint, data, config);
  }
  
  async put(endpoint, data, config) {
    return this.request('put', endpoint, data, config);
  }
  
  async delete(endpoint, config) {
    return this.request('delete', endpoint, null, config);
  }
}

// Create and export singleton instance
const apiConnection = new ApiConnection();
export default apiConnection;
