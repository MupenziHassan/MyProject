const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Here the default fallback is health-prediction-dev
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    
    // Modern connection without deprecated options
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
