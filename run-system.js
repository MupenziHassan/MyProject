const { spawn } = require('child_process');
const path = require('path');

// Function to run a command in a specific directory
const runCommand = (command, args, cwd) => {
  const process = spawn(command, args, { 
    cwd, 
    stdio: 'inherit',
    shell: true
  });

  return process;
};

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Health Prediction System...');
console.log('\x1b[36m%s\x1b[0m', '======================================');

// Start backend server
console.log('\x1b[33m%s\x1b[0m', '📡 Starting Backend Server...');
const backend = runCommand('npm', ['run', 'dev'], path.join(__dirname, 'backend'));

// Start frontend server with specific port
console.log('🖥️  Starting Frontend Server...');
const frontendProcess = spawn('npm', ['run', 'start'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\x1b[31m%s\x1b[0m', '🛑 Stopping all services...');
  backend.kill();
  frontendProcess.kill();
  process.exit();
});
