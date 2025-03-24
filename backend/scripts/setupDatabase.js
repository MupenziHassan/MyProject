const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDatabase, closeDatabase } = require('../config/database');

// Define user schema (simplified for setup purposes)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'] },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

// Define patient schema
const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateOfBirth: Date,
  gender: String,
  bloodType: String,
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: String
  }]
});

// Define doctor schema
const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  specialization: String,
  licenseNumber: String,
  experience: Number,
  isVerified: Boolean
});

/**
 * Setup database collections and test data
 * @param {boolean} dropExisting - Whether to drop existing collections
 */
async function setupDatabase(dropExisting = false) {
  try {
    // Connect to database
    const dbConnection = await connectDatabase();
    if (!dbConnection.success) {
      console.error('Failed to connect to database. Setup aborted.');
      process.exit(1);
    }

    // Set up models
    let User, Patient, Doctor;
    try {
      // Try to get existing models
      User = mongoose.model('User');
      Patient = mongoose.model('Patient');
      Doctor = mongoose.model('Doctor');
      console.log('Using existing models');
    } catch (error) {
      // Create models if they don't exist
      User = mongoose.model('User', userSchema);
      Patient = mongoose.model('Patient', patientSchema);
      Doctor = mongoose.model('Doctor', doctorSchema);
      console.log('Created new models');
    }

    // Drop collections if instructed
    if (dropExisting) {
      console.log('Dropping existing collections...');
      await User.collection.drop().catch(err => {
        if (err.code !== 26) console.error('Error dropping User collection:', err);
        else console.log('User collection does not exist yet');
      });
      await Patient.collection.drop().catch(err => {
        if (err.code !== 26) console.error('Error dropping Patient collection:', err);
        else console.log('Patient collection does not exist yet');
      });
      await Doctor.collection.drop().catch(err => {
        if (err.code !== 26) console.error('Error dropping Doctor collection:', err);
        else console.log('Doctor collection does not exist yet');
      });
    }

    // Check if users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0 && !dropExisting) {
      console.log(`Database already has ${userCount} users. Skipping test data creation.`);
      console.log('Use --drop flag to force recreate test data');
      await closeDatabase();
      return;
    }

    console.log('Creating test users...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log(`Admin created: admin@example.com (password: admin123)`);
    
    // Create doctor user
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctor = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'doctor@example.com',
      password: doctorPassword,
      role: 'doctor'
    });
    
    await Doctor.create({
      user: doctor._id,
      specialization: 'Oncology',
      licenseNumber: 'MED12345',
      experience: 10,
      isVerified: true
    });
    console.log(`Doctor created: doctor@example.com (password: doctor123)`);
    
    // Create patient user
    const patientPassword = await bcrypt.hash('patient123', 10);
    const patient = await User.create({
      name: 'John Smith',
      email: 'patient@example.com',
      password: patientPassword,
      role: 'patient'
    });
    
    await Patient.create({
      user: patient._id,
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      bloodType: 'O+',
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: new Date('2018-03-10'),
          status: 'Managed with medication'
        }
      ]
    });
    console.log(`Patient created: patient@example.com (password: patient123)`);

    // Create an extra doctor account for testing
    const doctor2Password = await bcrypt.hash('doctor456', 10);
    const doctor2 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'doctor2@example.com',
      password: doctor2Password,
      role: 'doctor'
    });
    
    await Doctor.create({
      user: doctor2._id,
      specialization: 'Cardiology',
      licenseNumber: 'MED67890',
      experience: 15,
      isVerified: true
    });
    console.log(`Doctor created: doctor2@example.com (password: doctor456)`);

    // Create another test patient
    const patient2Password = await bcrypt.hash('patient456', 10);
    const patient2 = await User.create({
      name: 'Jane Doe',
      email: 'patient2@example.com',
      password: patient2Password,
      role: 'patient'
    });
    
    await Patient.create({
      user: patient2._id,
      dateOfBirth: new Date('1990-10-25'),
      gender: 'female',
      bloodType: 'B-',
      medicalHistory: [
        {
          condition: 'Asthma',
          diagnosedDate: new Date('2010-07-22'),
          status: 'Controlled with inhaler'
        }
      ]
    });
    console.log(`Patient created: patient2@example.com (password: patient456)`);

    console.log('Database setup completed successfully');
    await closeDatabase();
  } catch (error) {
    console.error('Error setting up database:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Run directly if called from command line
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dropExisting = args.includes('--drop');
  
  setupDatabase(dropExisting).then(() => {
    console.log('Setup complete');
    process.exit(0);
  }).catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
  });
}

module.exports = setupDatabase;
