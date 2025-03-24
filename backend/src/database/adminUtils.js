const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loading environment from: ${envPath}`);
} else {
  dotenv.config();
  console.log('Loading environment variables from system');
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

// List all collections with document counts
const listCollections = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      return { success: false, error: 'Failed to connect to database' };
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const result = [];
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      result.push({
        name: collection.name,
        count,
      });
    }
    
    console.table(result);
    
    await mongoose.connection.close();
    return { success: true, collections: result };
  } catch (error) {
    console.error('Error listing collections:', error);
    return { success: false, error: error.message };
  }
};

// Backup collection data to JSON
const backupCollectionToJSON = async (collectionName) => {
  try {
    const connected = await connectDB();
    if (!connected) {
      return { success: false, error: 'Failed to connect to database' };
    }
    
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.error(`Collection ${collectionName} does not exist`);
      await mongoose.connection.close();
      return { success: false, error: `Collection ${collectionName} does not exist` };
    }
    
    // Fetch all documents
    const documents = await mongoose.connection.db.collection(collectionName).find({}).toArray();
    
    // Create backups directory if it doesn't exist
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Write to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(backupDir, `${collectionName}_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(documents, null, 2));
    
    console.log(`Backup created at: ${backupPath}`);
    
    await mongoose.connection.close();
    return { success: true, path: backupPath, count: documents.length };
  } catch (error) {
    console.error(`Error backing up collection ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Clear a collection
const clearCollection = async (collectionName) => {
  try {
    const connected = await connectDB();
    if (!connected) {
      return { success: false, error: 'Failed to connect to database' };
    }
    
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.error(`Collection ${collectionName} does not exist`);
      await mongoose.connection.close();
      return { success: false, error: `Collection ${collectionName} does not exist` };
    }
    
    // Delete all documents
    const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
    
    console.log(`Cleared ${result.deletedCount} documents from ${collectionName}`);
    
    await mongoose.connection.close();
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error(`Error clearing collection ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Run a command based on arguments
const runCommand = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Available commands:');
    console.log('  list - List all collections');
    console.log('  backup <collection> - Backup a collection to JSON');
    console.log('  clear <collection> - Clear a collection');
    return;
  }
  
  switch (command) {
    case 'list':
      await listCollections();
      break;
      
    case 'backup':
      if (!args[1]) {
        console.error('Please specify a collection name');
        return;
      }
      await backupCollectionToJSON(args[1]);
      break;
      
    case 'clear':
      if (!args[1]) {
        console.error('Please specify a collection name');
        return;
      }
      
      const confirmed = await new Promise(resolve => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question(`Are you sure you want to clear all documents from ${args[1]}? (y/N) `, answer => {
          readline.close();
          resolve(answer.toLowerCase() === 'y');
        });
      });
      
      if (confirmed) {
        await clearCollection(args[1]);
      } else {
        console.log('Operation cancelled');
      }
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
  }
};

// If run directly from command line
if (require.main === module) {
  runCommand()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
} else {
  // Export functions for use in other modules
  module.exports = {
    connectDB,
    listCollections,
    backupCollectionToJSON,
    clearCollection
  };
}
