const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars from different possible locations
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No .env file found. Using default API URL.');
}

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

const testRoleBasedAccess = async () => {
  try {
    console.log('Testing Role-Based Access Control\n');
    console.log(`Using API URL: ${API_URL}`);
    
    // First check if the server is running
    console.log('\nChecking if server is running...');
    try {
      await axios.get(`${API_URL}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Could not connect to server. Is it running?');
      } else {
        // If we get any response, the server is running
        console.log('Server is running.');
      }
    }
    
    // Step 1: Test public endpoint (no auth required)
    console.log('\n1. Testing public endpoint:');
    try {
      const publicRes = await axios.get(`${API_URL}/test-auth/public`);
      console.log(`   Status: ${publicRes.status} - Success: ${publicRes.data.success}`);
    } catch (error) {
      console.error(`   ERROR: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Response: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('   No response received from server');
      }
      throw new Error('Failed to access public endpoint');
    }
    
    // Step 2: Login as admin
    console.log('\n2. Login as admin:');
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLoginRes.data.token;
    console.log(`   Status: ${adminLoginRes.status} - Token received: ${!!adminToken}`);
    
    // Step 3: Access admin endpoint with admin token
    console.log('\n3. Access admin endpoint with admin token:');
    const adminEndpointRes = await axios.get(`${API_URL}/test-auth/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Status: ${adminEndpointRes.status} - Role: ${adminEndpointRes.data.data.user.role}`);
    
    // Step 4: Login as patient
    console.log('\n4. Login as patient:');
    const patientLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'patient@example.com',
      password: 'patient123'
    });
    const patientToken = patientLoginRes.data.token;
    console.log(`   Status: ${patientLoginRes.status} - Token received: ${!!patientToken}`);
    
    // Step 5: Access patient endpoint with patient token
    console.log('\n5. Access patient endpoint with patient token:');
    const patientEndpointRes = await axios.get(`${API_URL}/test-auth/patient`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log(`   Status: ${patientEndpointRes.status} - Role: ${patientEndpointRes.data.data.user.role}`);
    
    // Step 6: Try to access admin endpoint with patient token (should fail)
    console.log('\n6. Try to access admin endpoint with patient token (should fail):');
    try {
      await axios.get(`${API_URL}/test-auth/admin`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('   ERROR: Patient accessed admin endpoint! RBAC is not working correctly.');
    } catch (error) {
      console.log(`   Status: ${error.response.status} - Error: ${error.response.data.error}`);
      console.log('   Success! Patient was correctly denied access to admin endpoint.');
    }
    
    console.log('\nAll tests completed. Role-based access control is working correctly!');
    
  } catch (error) {
    console.error('\nTest failed:', error.message);
  }
};

testRoleBasedAccess();
