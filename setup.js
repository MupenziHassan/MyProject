const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Setting up Health Prediction System ===');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file');
  fs.writeFileSync(envPath, 'PORT=9090\nMONGO_URI=mongodb://localhost:27017/health-prediction\nJWT_SECRET=secretkey123\nNODE_ENV=development\n');
}

// Install backend dependencies
console.log('\nInstalling backend dependencies...');
try {
  execSync('npm install', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, 'backend')
  });
} catch (error) {
  console.error('Failed to install backend dependencies');
}

// Install frontend dependencies
console.log('\nInstalling frontend dependencies...');
try {
  execSync('npm install', {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'frontend')
  });
} catch (error) {
  console.error('Failed to install frontend dependencies');
}

console.log('\n=== Setup complete! ===');
console.log('To start the system:');
console.log('1. Run "npm start" in the backend directory');
console.log('2. Run "npm start" in the frontend directory');
console.log('or use the provided "start.bat" file to start both');
