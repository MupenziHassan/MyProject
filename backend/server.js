const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loading environment from: ${envPath}`);
} else {
  dotenv.config();
  console.log('Loading environment variables from system');
}

// Create Express app
const app = express();

// Enable CORS - accept connections from anywhere during development
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('dev'));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint - critical for frontend connectivity
app.get('/api/health-check', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    port: req.socket.localPort,
    dbStatus: global.dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patient', patientRoutes);
app.use('/api/v1/doctor', doctorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message });
});

// Connect to MongoDB with enhanced error handling
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    global.dbConnected = true;
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    
    if (err.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Make sure your MongoDB is running.');
    }
    
    global.dbConnected = false;
    return false;
  }
};

// Use a fixed port with a simple fallback mechanism
const PORT = process.env.PORT || 5000;
let currentPort = PORT;

// Start server function
const startServer = async () => {
  // First connect to the database
  const dbConnected = await connectMongoDB();
  
  const server = app.listen(currentPort, () => {
    console.log(`Server running on port ${currentPort}`);
    console.log(`Database status: ${dbConnected ? 'Connected' : 'Disconnected'}`);
    
    // Save port to a file that frontend can read
    try {
      fs.writeFileSync(path.join(__dirname, 'server-port.txt'), currentPort.toString());
      console.log(`Server port saved to server-port.txt: ${currentPort}`);
    } catch (err) {
      console.error('Failed to write server port to file:', err.message);
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${currentPort} already in use, trying port ${currentPort + 1}`);
      currentPort += 1;
      startServer();
    } else {
      console.error('Server error:', error);
    }
  });
};

// Add a status endpoint that includes database status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    server: {
      status: 'running',
      port: currentPort
    },
    database: {
      connected: global.dbConnected,
      name: process.env.MONGO_URI?.split('/').pop() || 'health-prediction-dev'
    },
    timestamp: new Date().toISOString()
  });
});

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
