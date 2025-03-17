const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Set up readline interface for CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define paths
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

// Available commands
const commands = {
  1: { name: 'Setup database (create test users)', action: setupDatabase },
  2: { name: 'Start backend server', action: startBackend },
  3: { name: 'Start frontend development server', action: startFrontend },
  4: { name: 'Start both backend and frontend', action: startBoth },
  5: { name: 'Test backend connection', action: testBackendConnection },
  6: { name: 'Exit', action: () => {
    console.log('Exiting...');
    process.exit(0);
  }}
};

// Main menu
function showMainMenu() {
  console.log('\n=== Health Prediction System Project Runner ===\n');
  
  Object.entries(commands).forEach(([key, command]) => {
    console.log(`${key}. ${command.name}`);
  });
  
  rl.question('\nEnter command number: ', (answer) => {
    if (commands[answer]) {
      commands[answer].action();
    } else {
      console.log('Invalid command number');
      showMainMenu();
    }
  });
}

// Setup database
async function setupDatabase() {
  console.log('\nSetting up database with test users...');
  
  const setupProcess = spawn('node', ['src/setupDatabase.js'], { 
    cwd: backendPath,
    stdio: 'inherit'
  });
  
  setupProcess.on('close', (code) => {
    console.log(`\nDatabase setup completed with code ${code}`);
    rl.question('\nPress Enter to return to main menu...', () => {
      showMainMenu();
    });
  });
}

// Start backend server
function startBackend() {
  console.log('\nStarting backend server...');
  
  const serverProcess = spawn('node', ['server.js'], { 
    cwd: backendPath,
    stdio: 'inherit'
  });
  
  serverProcess.on('close', (code) => {
    console.log(`\nBackend server exited with code ${code}`);
    showMainMenu();
  });
}

// Start frontend development server
function startFrontend() {
  console.log('\nStarting frontend development server...');
  
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  
  try {
    const frontendProcess = spawn(npmCmd, ['start'], { 
      cwd: frontendPath,
      stdio: 'inherit',
      shell: true // Add shell option for better cross-platform support
    });
    
    frontendProcess.on('close', (code) => {
      console.log(`\nFrontend server exited with code ${code}`);
      showMainMenu();
    });
    
    frontendProcess.on('error', (err) => {
      console.error('Error starting frontend server:', err);
      showMainMenu();
    });
  } catch (error) {
    console.error('Failed to start frontend server:', error);
    showMainMenu();
  }
}

// Start both servers
function startBoth() {
  console.log('\nStarting both backend and frontend servers...');
  
  // Start backend
  let serverProcess;
  try {
    serverProcess = spawn('node', ['server.js'], { 
      cwd: backendPath,
      stdio: 'inherit',
      shell: true // Add shell option for better cross-platform support
    });
    
    serverProcess.on('error', (err) => {
      console.error('Error starting backend server:', err);
    });
  } catch (error) {
    console.error('Failed to spawn backend server process:', error);
    showMainMenu();
    return;
  }
  
  // Start frontend after a short delay
  setTimeout(() => {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    
    try {
      const frontendProcess = spawn(npmCmd, ['start'], { 
        cwd: frontendPath,
        stdio: 'inherit',
        shell: true // Add shell option for better cross-platform support
      });
      
      frontendProcess.on('close', (code) => {
        console.log(`\nFrontend server exited with code ${code}`);
        if (serverProcess) {
          console.log('Stopping backend server...');
          serverProcess.kill();
        }
        showMainMenu();
      });
      
      frontendProcess.on('error', (err) => {
        console.error('Error starting frontend server:', err);
        if (serverProcess) {
          console.log('Stopping backend server due to frontend error...');
          serverProcess.kill();
        }
        showMainMenu();
      });
    } catch (error) {
      console.error('Failed to spawn frontend process:', error);
      if (serverProcess) {
        console.log('Stopping backend server...');
        serverProcess.kill();
      }
      showMainMenu();
    }
  }, 5000);
}

// Test backend connection
async function testBackendConnection() {
  console.log('\nTesting backend connection...');
  
  const axios = require('axios');
  const ports = [9090, 9091, 9092, 9093, 5000, 3000, 8000];
  
  for (const port of ports) {
    try {
      console.log(`Testing connection on port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/api/health-check`, {
        timeout: 2000
      });
      
      console.log(`\n✅ Successfully connected to backend on port ${port}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      rl.question('\nPress Enter to return to main menu...', () => {
        showMainMenu();
      });
      
      return;
    } catch (error) {
      console.log(`❌ Failed to connect on port ${port}: ${error.message}`);
    }
  }
  
  console.log('\n❌ Could not connect to backend on any port');
  rl.question('\nPress Enter to return to main menu...', () => {
    showMainMenu();
  });
}

// Start the app
showMainMenu();
