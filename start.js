const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('    Health Prediction System - University Presentation');
console.log('========================================================');

// Create .env file if it doesn't exist (for consistent configuration)
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\nCreating .env file with default settings...');
  const envContent = `PORT=5000
MONGO_URI=mongodb://localhost:27017/health-prediction
JWT_SECRET=presentation-demo-secret-key
NODE_ENV=development`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✓ .env file created');
}

// Create test users to ensure database has demo data
console.log('\nEnsuring demo users exist in database...');
const setupUsers = spawn('node', [path.join(__dirname, 'backend', 'utils', 'createTestUser.js')], {
  stdio: 'inherit'
});

setupUsers.on('exit', (code) => {
  if (code !== 0) {
    console.log('⚠️ Warning: Could not set up test users. Login may not work.');
  }
  
  console.log('\nStarting backend server...');
  const backend = spawn('node', [path.join(__dirname, 'backend', 'server.js')], {
    stdio: 'inherit'
  });
  
  backend.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
  
  // Wait before starting frontend
  console.log('\nWaiting for backend to initialize (5 seconds)...');
  setTimeout(() => {
    console.log('\nStarting frontend...');
    const frontend = spawn('npm', ['start'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, 'frontend')
    });
    
    frontend.on('error', (err) => {
      console.error('Failed to start frontend:', err);
    });
    
    // Show presentation instructions
    console.log('\n========================================================');
    console.log('    System is starting! Login credentials:');
    console.log('    - Patient: patient@example.com / patient123');
    console.log('    - Doctor: doctor@example.com / doctor123');
    console.log('    - Admin: admin@example.com / admin123');
    console.log('========================================================');
    
    console.log('\nPress Ctrl+C twice to stop all servers when done');
  }, 5000);
});
