const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Parser } = require('json2csv');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loading environment from: ${envPath}`);
} else {
  console.warn('No .env file found, using default settings');
}

// Import models
const models = require('../models');

/**
 * Export collection data to CSV file
 * @param {string} collectionName - Name of the collection to export
 * @param {string} outputPath - Path to save the CSV file (optional)
 * @param {Object} query - MongoDB query to filter documents (optional)
 * @param {Object} options - Additional options like fields to include (optional)
 * @returns {Promise<Object>} - Results of the export operation
 */
async function exportToCsv(collectionName, outputPath, query = {}, options = {}) {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      throw new Error(`Collection "${collectionName}" not found`);
    }
    
    // Check if model exists
    if (!models[collectionName] && !models[collectionName.charAt(0).toUpperCase() + collectionName.slice(1)]) {
      console.warn(`No model found for collection "${collectionName}". Using raw MongoDB query.`);
    }
    
    // Get model or use raw collection
    const model = models[collectionName] || models[collectionName.charAt(0).toUpperCase() + collectionName.slice(1)];
    
    let documents;
    if (model) {
      // Use Mongoose model
      documents = await model.find(query).lean();
    } else {
      // Use raw MongoDB collection
      documents = await mongoose.connection.db.collection(collectionName).find(query).toArray();
    }
    
    console.log(`Found ${documents.length} documents in collection "${collectionName}"`);
    
    if (documents.length === 0) {
      console.log('No documents to export');
      return { success: true, count: 0 };
    }
    
    // Prepare data for CSV
    // Convert ObjectIDs to strings and handle nested objects
    const preparedData = documents.map(doc => {
      const prepared = { ...doc };
      
      // Convert _id to string
      if (prepared._id) {
        prepared._id = prepared._id.toString();
      }
      
      // Convert other ObjectIDs to strings
      for (const key in prepared) {
        if (prepared[key] instanceof mongoose.Types.ObjectId) {
          prepared[key] = prepared[key].toString();
        }
        
        // Handle dates
        if (prepared[key] instanceof Date) {
          prepared[key] = prepared[key].toISOString();
        }
      }
      
      return prepared;
    });
    
    // Generate default output path if not provided
    if (!outputPath) {
      const exportDir = path.join(__dirname, '../../data/export');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      outputPath = path.join(exportDir, `${collectionName}_${timestamp}.csv`);
    }
    
    // Get fields to include
    let fields = options.fields;
    if (!fields) {
      // Get fields from first document
      fields = Object.keys(preparedData[0]);
      
      // Filter out fields that have objects or arrays as values
      fields = fields.filter(field => {
        const value = preparedData[0][field];
        return !(value && typeof value === 'object');
      });
    }
    
    // Create CSV parser
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(preparedData);
    
    // Write to file
    fs.writeFileSync(outputPath, csv);
    
    console.log(`Exported ${documents.length} documents to ${outputPath}`);
    
    return {
      success: true,
      count: documents.length,
      path: outputPath
    };
    
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the function if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node exportToCsv.js <collectionName> [outputPath]');
    process.exit(1);
  }
  
  const collectionName = args[0];
  const outputPath = args[1];
  
  exportToCsv(collectionName, outputPath)
    .then((result) => {
      if (result.success) {
        console.log('CSV export completed successfully');
      } else {
        console.error('CSV export failed:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unhandled error during CSV export:', error);
      process.exit(1);
    });
}

module.exports = exportToCsv;
