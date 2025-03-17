/**
 * This script checks if the backend server is running and starts it if not
 */
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

console.log('Checking if backend server is running...');

// Check if server is running on port 9091
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:9091/api/v1', (res) => {
      console.log(`Server is running! Status code: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`Server check failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      console.log('Server check timed out');
      resolve(false);
    });
  });
};

// Start the server
const startServer = async () => {
  console.log('Starting backend server...');
  
  const serverProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true,
    detached: true
  });
  
  serverProcess.unref();
  
  console.log('Backend server started with PID:', serverProcess.pid);
  console.log('Waiting for server to initialize...');
  
  // Wait for server to start (max 10 seconds)
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isRunning = await checkServer();
    if (isRunning) {
      console.log('Server is now ready!');
      return true;
    }
    attempts++;
    console.log(`Waiting for server... (${attempts}/${maxAttempts})`);
  }
  
  console.error('Server did not start properly within the timeout period.');
  return false;
};

// Main function
const main = async () => {
  const isServerRunning = await checkServer();
  
  if (!isServerRunning) {
    console.log('Server is not running. Starting it now...');
    const started = await startServer();
    
    if (started) {
      console.log('✅ Server successfully started! You can now use the application.');
    } else {
      console.error('❌ Failed to start the server. Please start it manually:');
      console.error('   1. Navigate to the backend directory: cd backend');
      console.error('   2. Run the server: node server.js');
    }
  } else {
    console.log('✅ Server is already running! You can use the application.');
  }
};

main();
