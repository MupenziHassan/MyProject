const axios = require('axios');

const checkServer = async () => {
  console.log('Checking server status...');
  
  // Try different ports
  const ports = [8000, 5000, 5001, 3000];
  
  for (const port of ports) {
    try {
      console.log(`\nTrying http://localhost:${port}...`);
      const response = await axios.get(`http://localhost:${port}/`);
      
      console.log(`SUCCESS: Server is running on port ${port}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      // Also try the API endpoint
      try {
        const apiResponse = await axios.get(`http://localhost:${port}/api/v1`);
        console.log(`API endpoint is accessible on port ${port}`);
        console.log('API Response:', JSON.stringify(apiResponse.data, null, 2));
      } catch (apiError) {
        console.log(`API endpoint check failed on port ${port}:`, apiError.message);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`No server running on port ${port}`);
      } else {
        console.log(`Error connecting to port ${port}:`, error.message);
      }
    }
  }
};

checkServer();
