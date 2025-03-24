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
  console.warn('No .env file found, using default settings');
}

// Import models
const { User, Patient, Doctor, MedicalRecord } = require('../models');

/**
 * Import medical records from a JSON file
 * @param {string} filePath - Path to the JSON file with medical records
 * @param {boolean} validateOnly - If true, only validate the data without importing
 * @returns {Promise<Object>} - Results of the import operation
 */
async function importMedicalRecords(filePath, validateOnly = false) {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Read medical records from file
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let medicalRecords;
    
    try {
      medicalRecords = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Error parsing JSON file: ${error.message}`);
    }
    
    if (!Array.isArray(medicalRecords)) {
      throw new Error('File content is not an array of medical records');
    }
    
    console.log(`Found ${medicalRecords.length} medical records in file`);
    
    // Results tracking
    const results = {
      total: medicalRecords.length,
      valid: 0,
      invalid: 0,
      imported: 0,
      skipped: 0,
      errors: []
    };
    
    // Get all existing users
    const patients = await User.find({ role: 'patient' });
    const patientMap = new Map(patients.map(p => [p.email, p._id]));
    
    const doctors = await User.find({ role: 'doctor' });
    const doctorMap = new Map(doctors.map(d => [d.email, d._id]));
    
    // Process each medical record
    for (let i = 0; i < medicalRecords.length; i++) {
      const record = medicalRecords[i];
      
      try {
        // Validate record
        if (!record.patientEmail) {
          throw new Error('Missing patientEmail field');
        }
        if (!record.doctorEmail) {
          throw new Error('Missing doctorEmail field');
        }
        if (!record.visitDate) {
          throw new Error('Missing visitDate field');
        }
        if (!record.recordType) {
          throw new Error('Missing recordType field');
        }
        
        // Get patient and doctor IDs
        const patientId = patientMap.get(record.patientEmail);
        if (!patientId) {
          throw new Error(`Patient with email ${record.patientEmail} not found`);
        }
        
        const doctorId = doctorMap.get(record.doctorEmail);
        if (!doctorId) {
          throw new Error(`Doctor with email ${record.doctorEmail} not found`);
        }
        
        // Create record data object
        const recordData = {
          patient: patientId,
          doctor: doctorId,
          visitDate: new Date(record.visitDate),
          recordType: record.recordType,
          chiefComplaint: record.chiefComplaint,
          diagnosis: record.diagnosis || [],
          treatment: record.treatment || {},
          assessment: record.assessment,
          plan: record.plan,
          patientInstructions: record.patientInstructions
        };
        
        // Add vital signs if available
        if (record.vitalSigns) {
          recordData.vitalSigns = record.vitalSigns;
        }
        
        // Add lab tests if available
        if (record.labTests && record.labTests.length > 0) {
          recordData.labTests = record.labTests;
        }
        
        // Add imaging if available
        if (record.imaging && record.imaging.length > 0) {
          recordData.imaging = record.imaging;
        }
        
        // Add follow-up if available
        if (record.followUp) {
          recordData.followUp = record.followUp;
        }
        
        // Validate against schema
        const medicalRecord = new MedicalRecord(recordData);
        await medicalRecord.validate();
        results.valid++;
        
        // Import if not in validate-only mode
        if (!validateOnly) {
          // Check if record already exists to avoid duplicates
          const existingRecord = await MedicalRecord.findOne({
            patient: patientId,
            doctor: doctorId,
            visitDate: new Date(record.visitDate)
          });
          
          if (existingRecord) {
            console.log(`Record already exists for patient ${record.patientEmail} on ${record.visitDate}. Skipping.`);
            results.skipped++;
          } else {
            await medicalRecord.save();
            console.log(`Imported record ${i + 1} for patient ${record.patientEmail}`);
            results.imported++;
          }
        }
      } catch (error) {
        console.error(`Error processing record ${i + 1}:`, error.message);
        results.invalid++;
        results.errors.push({
          index: i,
          record: record.patientEmail ? `${record.patientEmail} on ${record.visitDate}` : 'Unknown',
          error: error.message
        });
      }
    }
    
    console.log(`
Import Results:
--------------
Total Records: ${results.total}
Valid Records: ${results.valid}
Invalid Records: ${results.invalid}
${validateOnly ? '' : `Imported: ${results.imported}
Skipped (duplicates): ${results.skipped}`}
    `);
    
    return results;
    
  } catch (error) {
    console.error('Error importing medical records:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Command line execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const validateOnly = args.includes('--validate');
  
  if (!filePath) {
    console.error('Please provide the path to the JSON file');
    console.error('Usage: node importMedicalRecords.js <filePath> [--validate]');
    process.exit(1);
  }
  
  importMedicalRecords(filePath, validateOnly)
    .then(() => {
      console.log(`Medical records ${validateOnly ? 'validation' : 'import'} completed`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = importMedicalRecords;
