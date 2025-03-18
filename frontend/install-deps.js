const { execSync } = require('child_process');
// Remove unused imports to fix warnings
// const fs = require('fs');
// const path = require('path');

console.log('Installing required frontend dependencies...');

// List of required dependencies
const dependencies = [
  'react-datepicker',
  'path-browserify',
  'stream-browserify',
  'assert',
  'util',
  'constants-browserify'
];

try {
  execSync(`npm install ${dependencies.join(' ')}`, { 
    stdio: 'inherit'
  });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:');
  console.error(error.message);
  process.exit(1);
}
