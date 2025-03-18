const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('===================================================');
console.log('    Starting Health Prediction System');
console.log('===================================================');

console.log('1. Starting backend server...');
const backend = spawn('npm', ['run', 'start:backend'], {
  stdio: 'inherit',
  shell: true
});

// Handle backend process errors
backend.on('error', (err) => {
  console.error('Failed to start backend server:', err);
  process.exit(1);
});

console.log('2. Waiting 5 seconds for backend to initialize...');
setTimeout(() => {
  console.log('3. Starting frontend...');
  const frontend = spawn('npm', ['run', 'start:frontend'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle frontend process errors
  frontend.on('error', (err) => {
    console.error('Failed to start frontend server:', err);
    process.exit(1);
  });

  console.log('===================================================');
  console.log('Health Prediction System is starting!');
  console.log('- Backend: http://localhost:9090 (may vary if port is in use)');
  console.log('- Frontend: http://localhost:3000');
  console.log('===================================================');
}, 5000);
