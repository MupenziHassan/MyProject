const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars from different possible locations
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
  console.warn('No .env file found. Please create one with MONGO_URI defined.');
}

const testConnection = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in your environment variables');
      console.log('Please create a .env file in the backend folder with MONGO_URI=mongodb://localhost:27017/health-prediction-dev');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Count documents in collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    mongoose.disconnect();
    console.log('Connection closed');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

testConnection();
