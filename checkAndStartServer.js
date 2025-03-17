const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Check if the server is running on any of the expected ports
 * @returns {Promise<{running: boolean, port: number|null, baseUrl: string|null}>}
 */
async function checkServerStatus() {
  console.log('Checking if backend server is running...');
  
  // Try to read the port file first (most accurate)
  const portFilePath = path.join(__dirname, 'backend', 'server-port.txt');
  
  if (fs.existsSync(portFilePath)) {
    try {
      const port = parseInt(fs.readFileSync(portFilePath, 'utf8').trim(), 10);
      console.log(`Found server port file indicating port ${port}, verifying...`);
      
      // Verify this port is actually working
      try {
        const response = await axios.get(`http://localhost:${port}/api/v1/status`, { timeout: 3000 });
        if (response.data && response.data.success) {
          console.log(`✅ Verified server is running on port ${port}`);
          return { running: true, port, baseUrl: `http://localhost:${port}` };
        }
      } catch (err) {
        console.log(`Port file exists but server is not responding on port ${port}`);
        // Continue checking other ports
      }
    } catch (err) {
      console.error(`Error reading port file:`, err.message);
      // Continue checking other ports
    }
  }
  
  // If port file didn't work, try common ports
  const commonPorts = [9090, 9091, 9092, 9093, 9094, 9095, 9096, 9097, 9098, 9099, 9100];
  
  for (const port of commonPorts) {
    try {
      console.log(`Checking port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/api/v1/status`, { timeout: 2000 });
      
      if (response.data && response.data.success) {
        console.log(`✅ Server is running on port ${port}`);
        return { running: true, port, baseUrl: `http://localhost:${port}` };
      }
    } catch (err) {
      // Just continue to the next port
    }
  }
  
  console.log('❌ No running server found on any of the expected ports');
  return { running: false, port: null, baseUrl: null };
}

/**
 * Start the backend server if it's not running
 */
async function startServerIfNeeded() {
  // First check if server is already running
  const status = await checkServerStatus();
  
  if (status.running) {
    console.log(`Server is already running on port ${status.port}`);
    return status;
  }
  
  console.log('Starting backend server...');
  
  // Path to server.js
  const serverPath = path.join(__dirname, 'backend', 'server.js');
  
  if (!fs.existsSync(serverPath)) {
    console.error(`Server file not found at ${serverPath}`);
    return { running: false, port: null, baseUrl: null };
  }
  
  // Start server as a detached process
  const serverProcess = spawn('node', [serverPath], {
    detached: true,
    stdio: 'ignore',
    shell: process.platform === 'win32'
  });
  
  serverProcess.unref();
  
  console.log('Server starting in background...');
  
  // Wait for server to start (up to 10 seconds)
  let serverStarted = false;
  let serverPort = null;
  let serverBaseUrl = null;
  
  for (let attempt = 0; attempt < 10; attempt++) {
    console.log(`Waiting for server to start... (attempt ${attempt + 1}/10)`);
    
    // Wait 1 second before checking
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if server is now running
    const status = await checkServerStatus();
    if (status.running) {
      serverStarted = true;
      serverPort = status.port;
      serverBaseUrl = status.baseUrl;
      break;
    }
  }
  
  if (serverStarted) {
    console.log(`✅ Server started successfully on port ${serverPort}`);
  } else {
    console.error('❌ Failed to start server after multiple attempts');
  }
  
  return { running: serverStarted, port: serverPort, baseUrl: serverBaseUrl };
}

// Export the functions for use in other files
module.exports = {
  checkServerStatus,
  startServerIfNeeded
};

// If this script is run directly, start the server if needed
if (require.main === module) {
  startServerIfNeeded().then(status => {
    if (status.running) {
      console.log(`Server is running at ${status.baseUrl}`);
      process.exit(0);
    } else {
      console.error('Failed to verify server is running');
      process.exit(1);
    }
  }).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
