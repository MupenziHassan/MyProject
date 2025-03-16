const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login functionality...');
    
    // Determine base URL
    const API_URL = 'http://localhost:5001/api/v1';
    console.log('API URL:', API_URL);
    
    // First check if server is running
    console.log('\nChecking if server is running...');
    try {
      await axios.get(`${API_URL.split('/api/v1')[0]}/api/v1`);
      console.log('Server is responsive.');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('ERROR: Cannot connect to the server. Make sure it is running on the correct port.');
        return;
      } else {
        console.log('Got a response from server (might be an error, but server is running)');
      }
    }
    
    // Test admin login
    console.log('\nTesting admin login:');
    try {
      const adminRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      console.log('Admin login success!');
      console.log('Response:', JSON.stringify(adminRes.data, null, 2));
    } catch (error) {
      console.error('Admin login failed:', error.message);
      if (error.response) {
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
        console.error('Status:', error.response.status);
      } else if (error.request) {
        console.error('No response received. Server might be unresponsive.');
      }
    }
    
    // Test patient login with more detailed error handling
    console.log('\nTesting patient login:');
    try {
      const patientRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'patient@example.com',
        password: 'patient123'
      });
      
      console.log('Patient login success!');
      console.log('Response:', JSON.stringify(patientRes.data, null, 2));
    } catch (error) {
      console.error('Patient login failed:', error.message);
      if (error.response) {
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
        console.error('Status:', error.response.status);
      } else if (error.request) {
        console.error('No response received. Server might be unresponsive.');
      } else {
        console.error('Error details:', error);
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testLogin();
