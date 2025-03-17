const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables from different possible locations
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No .env file found. Using default values.');
  // Set some default environment variables
  process.env.MONGO_URI = 'mongodb://localhost:27017/health-prediction-dev';
  process.env.JWT_SECRET = 'default-jwt-secret-for-development';
  process.env.JWT_EXPIRE = '30d';
}

// Verify MongoDB URI is set
if (!process.env.MONGO_URI) {
  console.error('MongoDB URI is not defined in environment variables!');
  process.env.MONGO_URI = 'mongodb://localhost:27017/health-prediction-dev';
  console.log('Using default MongoDB URI:', process.env.MONGO_URI);
}

// Connect to database
const connectDB = require('./src/config/db');
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Apply security middleware
app.use(require('./src/middleware/security').securityMiddleware);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(require('morgan')('dev'));
}

// Mount routes
app.use('/api/v1/auth', require('./src/routes/auth'));
try {
  app.use('/api/v1/users', require('./src/routes/users'));
} catch (error) {
  console.warn(`Route loading error (users): ${error.message}`);
}
try {
  app.use('/api/v1/doctors', require('./src/routes/doctors'));
} catch (error) {
  console.warn(`Route loading error (doctors): ${error.message}`);
}
try {
  app.use('/api/v1/patients', require('./src/routes/patients'));
} catch (error) {
  console.warn(`Route loading error (patients): ${error.message}`);
}
try {
  app.use('/api/v1/admin', require('./src/routes/admin'));
} catch (error) {
  console.warn(`Route loading error (admin): ${error.message}`);
}
try {
  app.use('/api/v1/predictions', require('./src/routes/predictions'));
} catch (error) {
  console.warn(`Route loading error (predictions): ${error.message}`);
}
try {
  app.use('/api/v1/tests', require('./src/routes/tests'));
} catch (error) {
  console.warn(`Route loading error (tests): ${error.message}`);
}
try {
  app.use('/api/v1/test-auth', require('./src/routes/testAuth'));
} catch (error) {
  console.warn(`Route loading error (test-auth): ${error.message}`);
}
app.use('/api/v1/notifications', require('./src/routes/notifications'));
app.use('/api/v1/appointments', require('./src/routes/appointments'));
app.use('/api/v1/mlapi', require('./src/routes/mlapi'));

// Add a server status endpoint
app.get('/api/v1/status', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: server?.address()?.port || 'unknown'
  });
});

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Health Prediction System API' });
});
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Health Prediction System API v1' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Use higher port range to avoid conflicts
const startingPort = 9090;

// Store the server instance so we can access its port
let server;

// Try ports sequentially until one works
const startServer = (port) => {
  server = app.listen(port)
    .on('listening', () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
      
      // Handle unhandled promise rejections
      process.on('unhandledRejection', (err, promise) => {
        console.log(`Error: ${err.message}`);
        server.close(() => process.exit(1));
      });
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Trying port ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
};

startServer(startingPort);
