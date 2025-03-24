const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from different possible locations
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../.env')
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
  console.warn('No .env file found. Using default connection settings.');
}

/**
 * Connect to the MongoDB database
 * @returns {Promise<Object>} Connection result
 */
const connectDatabase = async () => {
  try {
    // Default to development database if MONGO_URI is not defined
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    
    // Connect with enhanced options for better stability
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Reduce server selection timeout
      socketTimeoutMS: 45000, // Default socket timeout
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Identify if using Atlas or local MongoDB
    const isAtlas = mongoURI.includes('mongodb+srv');
    console.log(`Database type: ${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'}`);
    
    return { 
      success: true, 
      connection: conn,
      host: conn.connection.host,
      name: conn.connection.name 
    };
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Provide more helpful error messages
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server.');
      console.error('Please check your MongoDB connection string and make sure your database is running.');
    }
    
    return { 
      success: false, 
      error: error.message,
      details: error.name 
    };
  }
};

// Check database connection health
const checkDatabaseHealth = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        connected: false,
        status: 'Disconnected',
        readyState: mongoose.connection.readyState
      };
    }
    
    // Simple ping to verify connectivity
    await mongoose.connection.db.admin().ping();
    
    return {
      connected: true,
      status: 'Connected',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    };
  } catch (error) {
    return {
      connected: false,
      status: 'Error',
      error: error.message,
      readyState: mongoose.connection.readyState
    };
  }
};

// Close database connection
const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
    return { success: true };
  } catch (error) {
    console.error('Error closing database connection:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  connectDatabase,
  checkDatabaseHealth,
  closeDatabase
};
