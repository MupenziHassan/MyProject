const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loading environment from: ${envPath}`);
} else {
  console.warn('No .env file found, using default settings');
}

async function createIndexes() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    console.log('Creating indexes for collections...');
    
    // Users Collection
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ role: 1 });
    
    // Patients Collection
    await mongoose.connection.db.collection('patients').createIndex({ user: 1 }, { unique: true });
    await mongoose.connection.db.collection('patients').createIndex({ 'contactInfo.primaryPhone': 1 });
    
    // Doctors Collection
    await mongoose.connection.db.collection('doctors').createIndex({ user: 1 }, { unique: true });
    await mongoose.connection.db.collection('doctors').createIndex({ specialty: 1 });
    await mongoose.connection.db.collection('doctors').createIndex({ licenseNumber: 1 }, { unique: true });
    
    // Medical Records Collection
    await mongoose.connection.db.collection('medicalrecords').createIndex({ patient: 1, visitDate: -1 });
    await mongoose.connection.db.collection('medicalrecords').createIndex({ doctor: 1, visitDate: -1 });
    await mongoose.connection.db.collection('medicalrecords').createIndex({ 'diagnosis.icd10Code': 1 });
    
    // Appointments Collection
    await mongoose.connection.db.collection('appointments').createIndex({ patient: 1, dateTime: 1 });
    await mongoose.connection.db.collection('appointments').createIndex({ doctor: 1, dateTime: 1 });
    await mongoose.connection.db.collection('appointments').createIndex({ status: 1, dateTime: 1 });
    await mongoose.connection.db.collection('appointments').createIndex({ dateTime: 1 }); // For calendar views
    
    // Medications Collection
    await mongoose.connection.db.collection('medications').createIndex({ patient: 1, 'prescription.isActive': 1 });
    await mongoose.connection.db.collection('medications').createIndex({ name: 'text', genericName: 'text' });
    
    // Predictions Collection
    await mongoose.connection.db.collection('predictions').createIndex({ patient: 1, createdAt: -1 });
    await mongoose.connection.db.collection('predictions').createIndex({ predictionType: 1, 'result.riskLevel': 1 });
    
    // Tests Collection
    await mongoose.connection.db.collection('tests').createIndex({ patient: 1, 'dates.ordered': -1 });
    await mongoose.connection.db.collection('tests').createIndex({ status: 1 });
    
    // Notifications Collection
    await mongoose.connection.db.collection('notifications').createIndex({ recipient: 1, status: 1, createdAt: -1 });
    await mongoose.connection.db.collection('notifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    console.log('All indexes created successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Error creating indexes:', error);
    return { success: false, error: error.message };
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the function if called directly
if (require.main === module) {
  createIndexes()
    .then(result => {
      console.log('Index creation result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = createIndexes;
