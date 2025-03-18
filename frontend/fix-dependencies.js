const { execSync } = require('child_process');

console.log('Installing required dependencies for the Health Prediction System...');

// Core dependencies for UI and routing
const dependencies = [
  // React Bootstrap for UI components
  'react-bootstrap',
  'bootstrap',
  
  // Chart.js for the admin dashboard
  'chart.js',
  'react-chartjs-2',
  
  // Font Awesome icons
  '@fortawesome/fontawesome-free',
  
  // Date picker for appointments
  'react-datepicker'
];

try {
  execSync(`npm install ${dependencies.join(' ')}`, { 
    stdio: 'inherit'
  });
  
  console.log('\nAdding Bootstrap CSS import to index.js...');
  
  const fs = require('fs');
  const path = require('path');
  const indexPath = path.join(__dirname, 'src', 'index.js');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Add Bootstrap CSS import if it doesn't exist
    if (!content.includes('bootstrap/dist/css/bootstrap.min.css')) {
      const importStatement = "import 'bootstrap/dist/css/bootstrap.min.css';\nimport '@fortawesome/fontawesome-free/css/all.min.css';\n";
      content = importStatement + content;
      fs.writeFileSync(indexPath, content);
      console.log('Added Bootstrap and Font Awesome CSS imports to index.js');
    } else {
      console.log('Bootstrap CSS import already exists in index.js');
    }
  } else {
    console.log('Could not find index.js file');
  }
  
  console.log('\nDependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:');
  console.error(error.message);
  process.exit(1);
}
