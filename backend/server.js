const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const net = require('net'); // For port checking

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

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const healthCheckRoutes = require('./src/routes/healthCheck');
// ...other routes...

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health-check', healthCheckRoutes);
// ...other route applications...

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
    port: server?.address()?.port || process.env.PORT || 'unknown'
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

/**
 * Checks if a port is in use
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} True if port is in use, false otherwise
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        tester.close();
        resolve(false);
      })
      .listen(port);
  });
}

/**
 * Find available port from a range
 * @param {number} startPort - Starting port number
 * @param {number} endPort - Ending port number
 * @returns {Promise<number|null>} Available port or null if none found
 */
async function findAvailablePort(startPort, endPort) {
  console.log(`Searching for available port in range ${startPort}-${endPort}...`);
  
  // First try the preferred port (e.g., from config or env)
  const preferredPort = process.env.PORT || config?.backend?.port;
  if (preferredPort && preferredPort >= startPort && preferredPort <= endPort) {
    const inUse = await isPortInUse(preferredPort);
    if (!inUse) {
      console.log(`Preferred port ${preferredPort} is available`);
      return preferredPort;
    } else {
      console.log(`Preferred port ${preferredPort} is in use`);
    }
  }
  
  // Try each port in the specified range
  for (let port = startPort; port <= endPort; port++) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      console.log(`Found available port: ${port}`);
      return port;
    }
  }
  
  console.error(`No available ports in range ${startPort}-${endPort}`);
  return null;
}

/**
 * Start the server with automatic port selection
 */
async function startServer() {
  try {
    // Define port range - these ports will be checked in sequence
    const startPort = 9090;
    const endPort = 9100;
    
    // Find available port
    const port = await findAvailablePort(startPort, endPort);
    
    if (!port) {
      console.error('Failed to find available port. Server cannot start.');
      process.exit(1);
    }
    
    // Set the port for later reference
    process.env.PORT = port;
    
    // Start server on the available port
    server = app.listen(port, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
      
      // Create a port file for other processes to easily find the running server port
      const portFilePath = path.join(__dirname, 'server-port.txt');
      fs.writeFileSync(portFilePath, port.toString(), 'utf8');
      console.log(`Port number saved to ${portFilePath}`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      // Gracefully close the server before exiting
      if (server) {
        server.close(() => process.exit(1));
      } else {
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Store the server instance
let server;

// Start the server with automatic port selection
startServer();
