import axios from 'axios';

/**
 * Checks if the backend server is running and accessible
 * @returns {Promise<{connected: boolean, port?: number, error?: string}>}
 */
export const checkServerConnection = async () => {
  console.log('Checking server connection...');
  
  // First try the proxy setup (will use package.json proxy setting)
  try {
    const response = await axios.get('/api/v1', { timeout: 5000 });
    console.log('Server connection successful through proxy:', response.data);
    return { connected: true };
  } catch (proxyError) {
    console.log('Proxy connection failed, trying direct connections...', proxyError.message);
  }

  // Try direct connections to various ports
  const ports = [9091, 9090, 9092, 9093];
  
  for (const port of ports) {
    try {
      const response = await axios.get(`http://localhost:${port}/api/v1`, { timeout: 3000 });
      console.log(`Server connection successful on port ${port}:`, response.data);
      return { connected: true, port };
    } catch (error) {
      console.log(`Failed to connect on port ${port}:`, error.message);
    }
  }

  return {
    connected: false,
    error: 'Could not connect to backend server on any expected port'
  };
};

/**
 * Gets server connection instructions based on OS
 */
export const getServerStartInstructions = () => {
  const isWindows = navigator.platform.toLowerCase().includes('win');
  
  if (isWindows) {
    return [
      '1. Open Command Prompt as Administrator',
      '2. Navigate to the backend directory: cd path\\to\\Health-prediction-system\\backend',
      '3. Run the server: node server.js'
    ];
  } else {
    return [
      '1. Open Terminal',
      '2. Navigate to the backend directory: cd path/to/Health-prediction-system/backend',
      '3. Run the server: node server.js'
    ];
  }
};
