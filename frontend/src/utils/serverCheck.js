import axios from 'axios';

export const checkServerStatus = async () => {
  // Try the proxy first
  try {
    const response = await axios.get('/api/v1/status');
    if (response.data && response.data.success) {
      return {
        connected: true,
        port: response.data.port,
        method: 'proxy',
        serverTime: response.data.serverTime
      };
    }
  } catch (proxyError) {
    console.log('Proxy connection failed, trying direct connections...');
  }

  // Try direct connections to various ports
  const ports = [9091, 9090, 9092, 9093];
  
  for (const port of ports) {
    try {
      const response = await axios.get(`http://localhost:${port}/api/v1/status`);
      if (response.data && response.data.success) {
        return {
          connected: true,
          port: port,
          method: 'direct',
          serverTime: response.data.serverTime
        };
      }
    } catch (error) {
      console.log(`Failed to connect on port ${port}`);
    }
  }
  
  return {
    connected: false,
    error: 'Could not connect to any server port'
  };
};

// Run a server connectivity test and display results on the console
export const runServerCheck = async () => {
  console.log('Checking server connectivity...');
  const status = await checkServerStatus();
  
  if (status.connected) {
    console.log('✅ Server connected!');
    console.log(`Method: ${status.method}`);
    console.log(`Port: ${status.port}`);
    console.log(`Server time: ${status.serverTime}`);
    return true;
  } else {
    console.error('❌ Server connection failed');
    console.error(status.error);
    return false;
  }
};
