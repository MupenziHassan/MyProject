const { spawn, exec } = require('child_process');
const path = require('path');
const config = require('./config');
const fs = require('fs');

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

// Ensure the backend server is running on the correct port and handle port conflicts
exec('node serverCheck.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(stdout);
    if (stdout.includes('✅ Server successfully detected on port')) {
        const port = fs.readFileSync('backend/server-port.txt', 'utf8').trim();
        exec('npm run dev', { cwd: 'backend' });
        exec(`npm start -- --port=${port}`, { cwd: 'frontend' });
    } else {
        console.error('❌ Backend server is not running on the expected port.');
    }
});
