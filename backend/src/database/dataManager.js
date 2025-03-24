#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');
const seedUsers = require('./seedUsers');
const importMedicalRecords = require('./importMedicalRecords');
const migrateMockData = require('./migrateMockData');
const { validateDocument, batchValidate } = require('./dataValidation');

// Import models
const models = require('../models');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env file found, using default settings');
}

// Connect to MongoDB
async function connectMongo() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    return false;
  }
}

// Close MongoDB connection
async function closeMongo() {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}

// List collections and their document counts
async function listCollections() {
  const connected = await connectMongo();
  if (!connected) return;
  
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nDatabase Collections:');
    console.log('=====================');
    
    if (collections.length === 0) {
      console.log('No collections found');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`${collection.name}: ${count} documents`);
      }
    }
  } catch (error) {
    console.error('Error listing collections:', error);
  } finally {
    await closeMongo();
  }
}

// Export collection to JSON file
async function exportCollection() {
  const connected = await connectMongo();
  if (!connected) return;
  
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('\nAvailable Collections:');
    collectionNames.forEach((name, i) => {
      console.log(`${i + 1}. ${name}`);
    });
    
    const answer = await askQuestion('\nEnter collection number to export (or name): ');
    
    let selectedCollection;
    if (!isNaN(answer) && Number(answer) > 0 && Number(answer) <= collectionNames.length) {
      selectedCollection = collectionNames[Number(answer) - 1];
    } else if (collectionNames.includes(answer)) {
      selectedCollection = answer;
    } else {
      console.log('Invalid collection');
      await closeMongo();
      return;
    }
    
    console.log(`Exporting collection: ${selectedCollection}`);
    
    const documents = await mongoose.connection.db.collection(selectedCollection).find({}).toArray();
    
    if (documents.length === 0) {
      console.log('Collection is empty, nothing to export');
      await closeMongo();
      return;
    }
    
    // Get output file path
    const defaultFilePath = path.join(__dirname, `../../data/export/${selectedCollection}_${Date.now()}.json`);
    const outputPath = await askQuestion(`\nEnter output file path (default: ${defaultFilePath}): `) || defaultFilePath;
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Convert MongoDB ObjectIds to strings for better JSON compatibility
    const cleanedDocuments = documents.map(doc => {
      const cleaned = { ...doc };
      if (cleaned._id) {
        cleaned._id = cleaned._id.toString();
      }
      return cleaned;
    });
    
    fs.writeFileSync(outputPath, JSON.stringify(cleanedDocuments, null, 2));
    console.log(`Exported ${documents.length} documents to ${outputPath}`);
  } catch (error) {
    console.error('Error exporting collection:', error);
  } finally {
    await closeMongo();
  }
}

// Validate a JSON file against a model schema
async function validateJsonFile() {
  try {
    // Get available models
    const modelNames = Object.keys(models);
    
    console.log('\nAvailable Models:');
    modelNames.forEach((name, i) => {
      console.log(`${i + 1}. ${name}`);
    });
    
    const modelAnswer = await askQuestion('\nEnter model number to validate against (or name): ');
    
    let selectedModel;
    if (!isNaN(modelAnswer) && Number(modelAnswer) > 0 && Number(modelAnswer) <= modelNames.length) {
      selectedModel = modelNames[Number(modelAnswer) - 1];
    } else if (modelNames.includes(modelAnswer)) {
      selectedModel = modelAnswer;
    } else {
      console.log('Invalid model');
      return;
    }
    
    const model = models[selectedModel];
    console.log(`Selected model: ${selectedModel}`);
    
    // Get JSON file path
    const filePath = await askQuestion('\nEnter path to JSON file: ');
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let data;
    
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error parsing JSON file:', error.message);
      return;
    }
    
    if (!Array.isArray(data)) {
      // If not an array, validate as a single document
      data = [data];
    }
    
    console.log(`Validating ${data.length} documents...`);
    
    // Connect to MongoDB (required for some validation features)
    const connected = await connectMongo();
    if (!connected) return;
    
    try {
      // Batch validate
      const results = await batchValidate(data, model);
      
      console.log('\nValidation Results:');
      console.log(`Total: ${results.total}`);
      console.log(`Valid: ${results.valid}`);
      console.log(`Invalid: ${results.invalid}`);
      
      if (results.invalid > 0) {
        const showErrors = await askQuestion('\nShow validation errors? (y/n): ');
        
        if (showErrors.toLowerCase() === 'y') {
          const invalidResults = results.details.filter(d => !d.isValid);
          
          for (const result of invalidResults) {
            console.log(`\nDocument at index ${result.index}:`);
            console.log('Errors:');
            result.errors.forEach(err => {
              console.log(`- ${err.field || 'Document'}: ${err.message}`);
            });
          }
        }
      }
    } finally {
      await closeMongo();
    }
  } catch (error) {
    console.error('Error validating JSON file:', error);
    await closeMongo();
  }
}

// Ask a question and return the answer
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Main menu
async function mainMenu() {
  console.log('\n=========================================');
  console.log('Health Prediction System - Data Manager');
  console.log('=========================================');
  console.log('1. Seed initial user data');
  console.log('2. Import medical records from JSON');
  console.log('3. Migrate mock data to MongoDB');
  console.log('4. List database collections');
  console.log('5. Export collection to JSON');
  console.log('6. Validate JSON file against model');
  console.log('0. Exit');
  
  const answer = await askQuestion('\nSelect an option: ');
  
  switch (answer) {
    case '1':
      await seedUsers();
      break;
      
    case '2':
      const medicalRecordsFile = await askQuestion('Enter path to medical records JSON file: ');
      const validateOnly = await askQuestion('Validate only without importing? (y/n): ');
      await importMedicalRecords(medicalRecordsFile, validateOnly.toLowerCase() === 'y');
      break;
      
    case '3':
      const mockDataDir = await askQuestion('Enter path to mock data directory: ');
      await migrateMockData(mockDataDir);
      break;
      
    case '4':
      await listCollections();
      break;
      
    case '5':
      await exportCollection();
      break;
      
    case '6':
      await validateJsonFile();
      break;
      
    case '0':
      console.log('Exiting...');
      rl.close();
      process.exit(0);
      return;
      
    default:
      console.log('Invalid option');
  }
  
  await mainMenu();
}

// Run the main menu
if (require.main === module) {
  mainMenu().catch(error => {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  });
}

module.exports = {
  seedUsers,
  importMedicalRecords,
  migrateMockData,
  listCollections,
  exportCollection,
  validateJsonFile
};
