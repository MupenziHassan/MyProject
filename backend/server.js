const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Enable CORS - accept connections from anywhere during development
app.use(cors());

// Body parser middleware
app.use(express.json());

// Health check endpoint - critical for frontend connectivity
app.get('/api/health-check', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    port: req.socket.localPort 
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

// Connect to MongoDB with simplified error handling
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction')
  .then(() => {
    console.log('MongoDB Connected');
    global.dbConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    global.dbConnected = false;
  });

// Use a fixed port with a simple fallback mechanism
const PORT = process.env.PORT || 5000;
let currentPort = PORT;

// Simple port conflict resolution
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    currentPort = port;
    
    // Save port to a file that frontend can read
    try {
      fs.writeFileSync(path.join(__dirname, 'server-port.txt'), port.toString());
    } catch (err) {}
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} already in use, trying port ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', error);
    }
  });
};

startServer(PORT);

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
      name: process.env.MONGO_URI?.split('/').pop() || 'health-prediction'
    },
    timestamp: new Date().toISOString()
  });
});
