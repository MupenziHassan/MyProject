/**
 * Global configuration file for Health Prediction System
 * This centralizes important settings across frontend and backend
 */

const config = {
  // Backend configuration
  backend: {
    // Port ranges to try (in order of preference)
    portRange: {
      start: 9090,
      end: 9100,
      preferred: 9091, // Default preferred port
    },
    maxPortRetries: 10,
    cors: {
      // Origins that are allowed to connect to the API
      allowedOrigins: [
        'http://localhost:3000', // For frontend in dev mode
        'http://localhost:5000' // For possible frontend prod
      ]
    }
  },

  // Frontend configuration
  frontend: {
    port: 3000,
    apiRetries: 2, // Number of times to retry API calls
    apiTimeouts: {
      short: 3000,  // 3 seconds for UI blocking operations
      medium: 10000, // 10 seconds for data-heavy operations
      long: 30000   // 30 seconds for report generation, etc.
    }
  },

  // Database configuration
  database: {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev'
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-replace-in-production',
    expiresIn: process.env.JWT_EXPIRE || '30d'
  },

  // Feature flags (for toggling features)
  features: {
    autoStartBackend: true,   // Auto-start backend if not running
    dynamicPortDetection: true, // Dynamic port detection
    predictionsEnabled: true,  // Enable ML predictions
    videoConsultation: true,   // Enable video consultations
    notificationsEnabled: true // Enable notifications
  },

  // Constants
  constants: {
    healthCheckEndpoint: '/api/health-check',
    statusEndpoint: '/api/v1/status',
    // Files where we store port numbers
    portFiles: {
      backend: 'backend/server-port.txt'
    }
  }
};

module.exports = config;
