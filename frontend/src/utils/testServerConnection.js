import axios from 'axios';

/**
 * Tests connection to all possible backend ports
 * @returns {Promise<{success: boolean, port: number|null, message: string}>}
 */
export const testAllServerPorts = async () => {
  const ports = [9091, 9090, 9092, 9093, 5000, 8000, 3000];
  const results = [];
  
  console.log('Testing connection to all possible backend ports...');
  
  for (const port of ports) {
    try {
      console.log(`Testing port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/api/health-check`, {
        timeout: 2000
      });
      
      console.log(`✅ Port ${port} responded:`, response.data);
      results.push({
        port,
        success: true,
        data: response.data
      });
      
      // Save the successful port to localStorage
      localStorage.setItem('api_port', port.toString());
      
      return {
        success: true,
        port,
        message: `Connected successfully to backend server on port ${port}`
      };
    } catch (error) {
      console.log(`❌ Port ${port} failed:`, error.message);
      results.push({
        port,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log('All port tests completed. Results:', results);
  
  // Check if any port was successful
  const successfulPort = results.find(r => r.success);
  if (successfulPort) {
    return {
      success: true,
      port: successfulPort.port,
      message: `Connected successfully to backend server on port ${successfulPort.port}`
    };
  }
  
  return {
    success: false,
    port: null,
    message: 'Could not connect to backend server on any port. Is the server running?',
    details: results
  };
};

/**
 * Can be used during application startup to ensure connectivity
 */
export const ensureServerConnection = async () => {
  try {
    // First check if we have a cached port
    const cachedPort = localStorage.getItem('api_port');
    if (cachedPort) {
      try {
        const response = await axios.get(`http://localhost:${cachedPort}/api/health-check`, {
          timeout: 2000
        });
        return {
          success: true,
          port: parseInt(cachedPort),
          message: `Connected to server using cached port ${cachedPort}`
        };
      } catch (error) {
        console.log(`Cached port ${cachedPort} failed:`, error.message);
        // Continue to test all ports
      }
    }
    
    // If cached port fails or doesn't exist, test all ports
    return await testAllServerPorts();
  } catch (error) {
    console.error('Error in ensureServerConnection:', error);
    return {
      success: false,
      port: null,
      message: `Connection error: ${error.message}`
    };
  }
};

export default { testAllServerPorts, ensureServerConnection };
