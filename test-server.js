const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/status',
  method: 'GET'
};

console.log('Testing server connection...');

const req = http.request(options, res => {
  console.log(`Status code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    console.log('Server is up and responding!');
  });
});

req.on('error', error => {
  console.error('Error connecting to server:', error.message);
  console.log('Your server appears to be down or not accessible.');
  console.log('Make sure your server is running with: npm run server');
});

req.end();
