const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { validateData } = require('./dataValidation');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env file found, using default settings');
}

// Import models
const { 
  User, 
  Patient, 
  Doctor, 
  MedicalRecord, 
  Test, 
  VitalRecord, 
  Medication, 
  Appointment 
} = require('../models');

/**
 * Migrate mock data from a directory to MongoDB collections
 * @param {string} mockDataDir - Directory containing mock data files
 * @returns {Promise<Object>} - Results of the migration
 */
async function migrateMockData(mockDataDir) {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Track migration results
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      details: {}
    };
    
    // Check if mockDataDir exists
    if (!fs.existsSync(mockDataDir)) {
      throw new Error(`Mock data directory not found: ${mockDataDir}`);
    }
    
    console.log(`Migrating mock data from: ${mockDataDir}`);
    
    // Map of data files to corresponding models and validation schemas
    const dataFileMap = [
      { 
        file: 'users.json', 
        model: User,
        createRelated: async (user) => {
          if (user.role === 'patient' && user.patientProfile) {
            await Patient.create({
              user: user._id,
              ...user.patientProfile
            });
          } else if (user.role === 'doctor' && user.doctorProfile) {
            await Doctor.create({
              user: user._id,
              ...user.doctorProfile
            });
          }
        }
      },
      { 
        file: 'medicalRecords.json', 
        model: MedicalRecord,
        idMappingField: 'patientId',
        idModelField: 'patient'
      },
      { 
        file: 'tests.json', 
        model: Test,
        idMappingField: 'patientId',
        idModelField: 'patient'
      },
      { 
        file: 'vitals.json', 
        model: VitalRecord,
        idMappingField: 'patientId',
        idModelField: 'patient'
      },
      { 
        file: 'medications.json', 
        model: Medication,
        idMappingField: 'patientId',
        idModelField: 'patient'
      },
      { 
        file: 'appointments.json', 
        model: Appointment,
        idMappingField: 'patientId',
        idModelField: 'patient'
      }
    ];
    
    // Get all user IDs for reference mapping
    const users = await User.find({}, 'email role');
    const userMap = new Map(users.map(u => [u.email, { id: u._id, role: u.role }]));
    
    // Process each data file
    for (const dataFile of dataFileMap) {
      const filePath = path.join(mockDataDir, dataFile.file);
      
      // Skip if file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.log(`File not found, skipping: ${dataFile.file}`);
        continue;
      }
      
      console.log(`Processing file: ${dataFile.file}`);
      
      // Read and parse the file
      let data;
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        data = JSON.parse(fileContent);
        
        if (!Array.isArray(data)) {
          throw new Error('File content is not an array');
        }
      } catch (error) {
        console.error(`Error reading/parsing ${dataFile.file}:`, error.message);
        results.details[dataFile.file] = {
          error: error.message,
          processed: 0,
          success: 0,
          failed: 0,
          skipped: 0
        };
        continue;
      }
      
      // Initialize tracking for this file
      results.details[dataFile.file] = {
        processed: data.length,
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };
      
      results.total += data.length;
      
      // Process each item in the file
      for (let i = 0; i < data.length; i++) {
        try {
          const item = data[i];
          
          // If this is a User model, handle password hashing
          if (dataFile.model === User && item.password) {
            const salt = await bcrypt.genSalt(10);
            item.password = await bcrypt.hash(item.password, salt);
          }
          
          // Resolve references if needed
          if (dataFile.idMappingField && dataFile.idModelField) {
            // If item has patientEmail, convert to patient ID
            if (item.patientEmail && userMap.has(item.patientEmail)) {
              item[dataFile.idModelField] = userMap.get(item.patientEmail).id;
            }
            // If item has doctorEmail, convert to doctor ID
            if (item.doctorEmail && userMap.has(item.doctorEmail)) {
              item.doctor = userMap.get(item.doctorEmail).id;
            }
            
            // Remove the email fields as they're not in the schema
            delete item.patientEmail;
            delete item.doctorEmail;
          }
          
          // Validate data
          const validationResult = validateData(item, dataFile.model.schema);
          if (!validationResult.isValid) {
            throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
          }
          
          // Check if the item already exists (using a unique identifier if available)
          let existingItem = null;
          if (item.email) {
            existingItem = await dataFile.model.findOne({ email: item.email });
          } else if (item._id) {
            existingItem = await dataFile.model.findById(item._id);
          }
          
          if (existingItem) {
            console.log(`Item already exists, skipping: ${item.email || item._id || i}`);
            results.skipped++;
            results.details[dataFile.file].skipped++;
            continue;
          }
          
          // Create the item
          const createdItem = await dataFile.model.create(item);
          
          // Handle related data creation (like profiles for users)
          if (dataFile.createRelated) {
            await dataFile.createRelated(item, createdItem);
          }
          
          console.log(`Successfully migrated item ${i + 1}/${data.length} from ${dataFile.file}`);
          results.success++;
          results.details[dataFile.file].success++;
        } catch (error) {
          console.error(`Error processing item ${i + 1} from ${dataFile.file}:`, error.message);
          results.failed++;
          results.details[dataFile.file].failed++;
          results.details[dataFile.file].errors.push({
            index: i,
            error: error.message
          });
        }
      }
    }
    
    console.log('\nMigration Results:');
    console.log(`Total items: ${results.total}`);
    console.log(`Successfully migrated: ${results.success}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Skipped (already exist): ${results.skipped}`);
    
    console.log('\nDetails by file:');
    for (const [file, detail] of Object.entries(results.details)) {
      console.log(`\n${file}:`);
      console.log(`  Processed: ${detail.processed}`);
      console.log(`  Success: ${detail.success}`);
      console.log(`  Failed: ${detail.failed}`);
      console.log(`  Skipped: ${detail.skipped}`);
      
      if (detail.errors && detail.errors.length > 0) {
        console.log(`  First few errors:`);
        detail.errors.slice(0, 3).forEach(err => {
          console.log(`    - Item ${err.index}: ${err.error}`);
        });
        if (detail.errors.length > 3) {
          console.log(`    - ... and ${detail.errors.length - 3} more errors`);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error migrating mock data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Command line execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const mockDataDir = args[0] || path.join(__dirname, '../../data/mock');
  
  migrateMockData(mockDataDir)
    .then(() => {
      console.log('Mock data migration completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err.message);
      process.exit(1);
    });
}

module.exports = migrateMockData;
