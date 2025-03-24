const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is defined
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    console.log('Connecting to MongoDB:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout for server selection
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Save connection status
    global.dbConnected = true;
    
    // Return the connection
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Failed to connect to database. Make sure your MongoDB server is running.');
    global.dbConnected = false;
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
