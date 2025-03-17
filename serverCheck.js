const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if server is running on specified port
const checkServer = (port) => {
  return new Promise((resolve) => {
    console.log(`Checking if server is running on port ${port}...`);
    
    const options = {
      hostname: 'localhost',
      port: port,
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Server is running on port ${port}! Status code: 200`);
        resolve(true);
      } else {
        console.error(`❌ Server responded with status code: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.error(`❌ Connection error on port ${port}: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.error(`❌ Connection timeout on port ${port}`);
      req.abort();
      resolve(false);
    });

    req.end();
  });
};

// Start the server
const startServer = async () => {
  console.log('Starting backend server...');
  
  // Check if server.js exists
  const serverPath = path.join(__dirname, 'backend', 'server.js');
  if (!fs.existsSync(serverPath)) {
    console.error(`❌ Server file not found at ${serverPath}`);
    return false;
  }
  
  // Get npm or node executable
  const cmd = process.platform === 'win32' ? 'node.exe' : 'node';
  
  // Start the server
  const serverProcess = spawn(cmd, [serverPath], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true,
    detached: true
  });
  
  // Unref the process so it continues running after this script exits
  serverProcess.unref();
  
  console.log(`⏳ Starting backend server (PID: ${serverProcess.pid})...`);
  console.log('⏳ Waiting for server to initialize...');
  
  // Wait for server to start (max 10 seconds)
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isRunning = await checkServer(9091);
    if (isRunning) {
      console.log('✅ Server is now ready!');
      return true;
    }
    attempts++;
    console.log(`⌛ Waiting for server... (${attempts}/${maxAttempts})`);
  }
  
  console.error('❌ Server did not start properly within the timeout period.');
  return false;
};

// Main function
const main = async () => {
  // Try multiple ports, focusing on 9091 first
  const ports = [9091, 9090, 9092, 9093];
  
  for (const port of ports) {
    const isServerRunning = await checkServer(port);
    if (isServerRunning) {
      console.log(`\n✅ Server successfully detected on port ${port}!`);
      console.log('You can now use the application.');
      process.exit(0); // Exit with success code to prevent further messages
      return;
    }
  }
  
  console.log('\n❌ Server is not running on any expected port. Attempting to start...');
  const started = await startServer();
  
  if (started) {
    console.log('\n✅ Server successfully started! You can now use the application.');
  } else {
    console.error('\n❌ Failed to start the server automatically. Try these manual steps:');
    console.error('   1. Navigate to the backend directory: cd backend');
    console.error('   2. Run the server: node server.js');
    console.error('   3. Verify the server is running on port 9091');
  }
};

// Run the main function
main();

const options = {
    hostname: 'localhost',
    port: 9091,
    timeout: 2000,
};

const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
        console.log('✅ Server is running on port 9091! Status code: 200');
    } else {
        console.error(`❌ Server responded with status code: ${res.statusCode}`);
    }
});

req.on('error', (err) => {
    console.error(`❌ Connection error on port 9091: ${err.message}`);
});

req.on('timeout', () => {
    console.error('❌ Connection timeout on port 9091');
    req.abort();
});

req.end();
