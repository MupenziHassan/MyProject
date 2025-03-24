const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const readline = require('readline');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loading environment from: ${envPath}`);
} else {
  console.warn('No .env file found, using default settings');
}

/**
 * Backup the entire database or specific collections
 * @param {string} outputDir - Directory to save backup files
 * @param {Array<string>} collections - Collections to backup (optional, backup all if not specified)
 * @param {boolean} useMongodump - Whether to use mongodump (if available) or mongoose
 * @returns {Promise<Object>} - Results of the backup operation
 */
async function backupDatabase(outputDir, collections = [], useMongodump = true) {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    
    // Extract database name from URI
    const dbName = mongoURI.split('/').pop().split('?')[0];
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }
    
    // Generate timestamp for backup
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    // Try mongodump first if requested
    if (useMongodump) {
      try {
        console.log('Checking if mongodump is available...');
        
        // Check if mongodump is available
        await new Promise((resolve, reject) => {
          exec('mongodump --version', (error) => {
            if (error) {
              console.log('mongodump not available, falling back to Mongoose');
              reject(error);
            } else {
              resolve();
            }
          });
        });
        
        // Construct mongodump command
        let command = `mongodump --uri="${mongoURI}" --out="${outputDir}/${dbName}_${timestamp}"`;
        
        // Add collections if specified
        if (collections.length > 0) {
          collections.forEach(collection => {
            command += ` --collection=${collection}`;
          });
        }
        
        console.log(`Running mongodump: ${command}`);
        
        // Execute mongodump
        const result = await new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve({ stdout, stderr });
            }
          });
        });
        
        console.log('mongodump output:', result.stdout);
        if (result.stderr) {
          console.error('mongodump errors:', result.stderr);
        }
        
        console.log(`Database backup completed using mongodump: ${outputDir}/${dbName}_${timestamp}`);
        
        return {
          success: true,
          method: 'mongodump',
          path: `${outputDir}/${dbName}_${timestamp}`,
          collections: collections.length > 0 ? collections : 'all'
        };
      } catch (error) {
        console.log(`mongodump failed: ${error.message}`);
        console.log('Falling back to Mongoose backup method');
      }
    }
    
    // If mongodump failed or wasn't requested, use Mongoose
    console.log('Backing up using Mongoose...');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Get all collections if not specified
    if (collections.length === 0) {
      const collectionsList = await mongoose.connection.db.listCollections().toArray();
      collections = collectionsList.map(c => c.name);
    }
    
    console.log(`Backing up ${collections.length} collections: ${collections.join(', ')}`);
    
    // Create backup directory
    const backupDir = path.join(outputDir, `${dbName}_${timestamp}`);
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Backup each collection
    for (const collection of collections) {
      console.log(`Backing up collection: ${collection}`);
      
      const documents = await mongoose.connection.db.collection(collection).find({}).toArray();
      
      // Skip empty collections
      if (documents.length === 0) {
        console.log(`Collection ${collection} is empty, skipping`);
        continue;
      }
      
      // Convert ObjectIDs to strings for better JSON compatibility
      const cleanedDocuments = documents.map(doc => {
        const cleaned = { ...doc };
        if (cleaned._id) {
          cleaned._id = cleaned._id.toString();
        }
        
        // Convert other ObjectIDs to strings
        Object.keys(cleaned).forEach(key => {
          if (cleaned[key] instanceof mongoose.Types.ObjectId) {
            cleaned[key] = cleaned[key].toString();
          }
        });
        
        return cleaned;
      });
      
      // Write to file
      const collectionFilePath = path.join(backupDir, `${collection}.json`);
      fs.writeFileSync(collectionFilePath, JSON.stringify(cleanedDocuments, null, 2));
      
      console.log(`Backed up ${documents.length} documents from ${collection}`);
    }
    
    console.log(`Database backup completed: ${backupDir}`);
    
    return {
      success: true,
      method: 'mongoose',
      path: backupDir,
      collections
    };
    
  } catch (error) {
    console.error('Error backing up database:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

// Ask user for confirmation
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(`${question} (y/N): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Run the function if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Set default output directory
  let outputDir = path.join(__dirname, '../../backups');
  let collections = [];
  let useMongodump = true;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--collections' && args[i + 1]) {
      collections = args[i + 1].split(',');
      i++;
    } else if (args[i] === '--no-mongodump') {
      useMongodump = false;
    }
  }
  
  backupDatabase(outputDir, collections, useMongodump)
    .then((result) => {
      if (result.success) {
        console.log('Database backup completed successfully');
      } else {
        console.error('Database backup failed:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unhandled error during database backup:', error);
      process.exit(1);
    });
}

module.exports = backupDatabase;
