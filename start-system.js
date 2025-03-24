/**
 * Comprehensive start script for Health Prediction System
 * Starts both backend and frontend services with proper coordination
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');

// Configuration
const BACKEND_PORTS = [9090, 9091, 9092, 9093, 5000];
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_DELAY = 1000; // ms

// Console colors for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Print banner
console.log(`${colors.cyan}${colors.bright}==============================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}    HEALTH PREDICTION SYSTEM STARTER    ${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}==============================================${colors.reset}`);

/**
 * Check if the server is already running on any of the expected ports
 * @returns {Promise<{running: boolean, port: number|null}>}
 */
async function checkServerRunning() {
  console.log(`\n${colors.blue}Checking if server is already running...${colors.reset}`);
  
  for (const port of BACKEND_PORTS) {
    try {
      const response = await axios.get(`http://localhost:${port}/api/health-check`, { timeout: 2000 });
      if (response.data && response.data.success) {
        console.log(`${colors.green}Server is already running on port ${port}${colors.reset}`);
        return { running: true, port };
      }
    } catch (err) {
      // Continue to next port
    }
  }
  
  return { running: false, port: null };
}

/**
 * Start the backend server
 * @returns {Promise<{success: boolean, port: number|null, process: any}>}
 */
async function startBackendServer() {
  console.log(`\n${colors.blue}Starting backend server...${colors.reset}`);
  
  const serverPath = path.join(__dirname, 'backend', 'server.js');
  if (!fs.existsSync(serverPath)) {
    console.error(`${colors.red}Server file not found at ${serverPath}${colors.reset}`);
    return { success: false, port: null, process: null };
  }
  
  // Start the server as a child process
  const serverProcess = spawn('node', [serverPath], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });
  
  console.log(`${colors.blue}Backend server starting (PID: ${serverProcess.pid})...${colors.reset}`);
  
  // Setup error handling
  serverProcess.on('error', (err) => {
    console.error(`${colors.red}Failed to start backend server: ${err.message}${colors.reset}`);
  });
  
  // Wait for server to start responding
  let port = null;
  let attempts = 0;
  
  while (attempts < MAX_RETRY_ATTEMPTS) {
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    attempts++;
    
    console.log(`${colors.blue}Waiting for backend to initialize (attempt ${attempts}/${MAX_RETRY_ATTEMPTS})...${colors.reset}`);
    
    // Try each potential port
    for (const testPort of BACKEND_PORTS) {
      try {
        const response = await axios.get(`http://localhost:${testPort}/api/health-check`, { timeout: 2000 });
        if (response.data && response.data.success) {
          port = testPort;
          console.log(`${colors.green}Backend server started successfully on port ${port}${colors.reset}`);
          
          // Save port to a file that frontend can read
          try {
            const portFilePath = path.join(__dirname, 'backend', 'server-port.txt');
            fs.writeFileSync(portFilePath, port.toString());
            console.log(`${colors.blue}Server port saved to server-port.txt: ${port}${colors.reset}`);
          } catch (err) {
            console.error(`${colors.yellow}Warning: Failed to write server port to file: ${err.message}${colors.reset}`);
          }
          
          return { success: true, port, process: serverProcess };
        }
      } catch (err) {
        // Continue to next port
      }
    }
  }
  
  console.error(`${colors.red}Failed to detect backend server running after ${MAX_RETRY_ATTEMPTS} attempts${colors.reset}`);
  return { success: false, port: null, process: serverProcess };
}

/**
 * Start the frontend development server
 * @param {number} backendPort - The port where backend is running
 * @returns {Promise<{success: boolean, process: any}>}
 */
async function startFrontendServer(backendPort) {
  console.log(`\n${colors.blue}Starting frontend server...${colors.reset}`);
  
  const frontendPath = path.join(__dirname, 'frontend');
  if (!fs.existsSync(frontendPath)) {
    console.error(`${colors.red}Frontend directory not found at ${frontendPath}${colors.reset}`);
    return { success: false, process: null };
  }
  
  // Set environment variable for proxy configuration or use any other method to communicate the backend port
  const env = { ...process.env };
  if (backendPort) {
    env.REACT_APP_API_PORT = backendPort.toString();
  }
  
  // Use npm.cmd on Windows, npm on other platforms
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  
  const frontendProcess = spawn(npmCmd, ['start'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true,
    env
  });
  
  console.log(`${colors.blue}Frontend server starting...${colors.reset}`);
  
  frontendProcess.on('error', (err) => {
    console.error(`${colors.red}Failed to start frontend server: ${err.message}${colors.reset}`);
  });
  
  // Return immediately without waiting for the frontend to be ready
  // as the npm start command will eventually open a browser window
  return { success: true, process: frontendProcess };
}

/**
 * Display login credentials
 */
function showLoginCredentials() {
  console.log(`\n${colors.cyan}${colors.bright}==============================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}    SYSTEM STARTED - LOGIN CREDENTIALS    ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}==============================================${colors.reset}`);
  console.log(`${colors.green}▶ Patient: ${colors.bright}patient@example.com / patient123${colors.reset}`);
  console.log(`${colors.green}▶ Doctor: ${colors.bright}doctor@example.com / doctor123${colors.reset}`);
  console.log(`${colors.green}▶ Admin: ${colors.bright}admin@example.com / admin123${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}==============================================${colors.reset}`);
  console.log(`\n${colors.yellow}Press Ctrl+C twice to stop all servers when done${colors.reset}`);
}

/**
 * Set up test users if they don't already exist
 */
async function setupTestUsers() {
  console.log(`\n${colors.blue}Ensuring test users exist in database...${colors.reset}`);
  
  // Paths to check for user setup scripts
  const setupPaths = [
    path.join(__dirname, 'backend', 'utils', 'createTestUser.js'),
    path.join(__dirname, 'backend', 'src', 'setupUsers.js'),
    path.join(__dirname, 'backend', 'src', 'setupTestUsers.js')
  ];
  
  // Find the first script that exists
  let setupScript = null;
  for (const scriptPath of setupPaths) {
    if (fs.existsSync(scriptPath)) {
      setupScript = scriptPath;
      break;
    }
  }
  
  if (!setupScript) {
    console.log(`${colors.yellow}Warning: No user setup script found. Login may not work properly.${colors.reset}`);
    return false;
  }
  
  return new Promise((resolve) => {
    const setupProcess = spawn('node', [setupScript], {
      stdio: 'inherit',
      shell: true
    });
    
    setupProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}Test users setup completed successfully${colors.reset}`);
        resolve(true);
      } else {
        console.log(`${colors.yellow}Warning: Test users setup completed with code ${code}${colors.reset}`);
        resolve(false);
      }
    });
  });
}

/**
 * Main function to start the entire system
 */
async function startSystem() {
  try {
    // First check if server is already running
    const serverStatus = await checkServerRunning();
    
    let backendPort = serverStatus.port;
    let backendProcess = null;
    
    if (!serverStatus.running) {
      // Try to set up test users first
      await setupTestUsers();
      
      // Start backend server
      const backendResult = await startBackendServer();
      if (backendResult.success) {
        backendPort = backendResult.port;
        backendProcess = backendResult.process;
      } else {
        console.error(`${colors.red}Failed to start backend server. Cannot continue.${colors.reset}`);
        process.exit(1);
      }
    }
    
    // Start frontend server
    const frontendResult = await startFrontendServer(backendPort);
    
    if (frontendResult.success) {
      // Show login credentials after a short delay
      setTimeout(() => {
        showLoginCredentials();
      }, 5000);
      
      // Setup graceful shutdown
      process.on('SIGINT', () => {
        console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
        
        if (frontendResult.process) {
          frontendResult.process.kill();
        }
        
        if (backendProcess) {
          backendProcess.kill();
        }
        
        process.exit(0);
      });
    }
  } catch (error) {
    console.error(`${colors.red}Error starting system: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Start the system
startSystem();
