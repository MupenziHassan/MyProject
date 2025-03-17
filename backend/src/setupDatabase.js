const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loading environment from: ${envPath}`);
}

// Define user schema
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

// Create models
const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

async function setupDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Clear existing users
    console.log('Clearing existing users...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    
    console.log('Creating test users...');
    
    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log(`Admin created: admin@example.com (password: admin123)`);
    
    // Create doctor
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
    
    // Create patient
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
    
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the setup
setupDatabase();
