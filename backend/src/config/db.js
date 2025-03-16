const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is defined
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    console.log('Connecting to MongoDB:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Failed to connect to MongoDB. Make sure your MongoDB server is running.');
    return false;
  }
};

module.exports = connectDB;
