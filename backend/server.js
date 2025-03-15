const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { securityMiddleware } = require('./src/middleware/security');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Apply security middleware
app.use(securityMiddleware);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/users', require('./src/routes/users'));
app.use('/api/v1/doctors', require('./src/routes/doctors'));
app.use('/api/v1/patients', require('./src/routes/patients'));
app.use('/api/v1/admin', require('./src/routes/admin'));
app.use('/api/v1/predictions', require('./src/routes/predictions'));
app.use('/api/v1/tests', require('./src/routes/tests'));
app.use('/api/v1/notifications', require('./src/routes/notifications'));
app.use('/api/v1/appointments', require('./src/routes/appointments'));
app.use('/api/v1/mlapi', require('./src/routes/mlapi'));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Health Prediction System API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
