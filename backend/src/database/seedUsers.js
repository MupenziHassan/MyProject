const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Import User model
const { User, Patient, Doctor } = require('../models');

// Sample user data
const users = [
  // Admin users
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'System Administrator',
    email: 'sysadmin@example.com',
    password: 'sysadmin123',
    role: 'admin'
  },
  
  // Doctor users
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'doctor123',
    role: 'doctor',
    doctorProfile: {
      specialty: 'Oncology',
      subSpecialties: ['Breast Cancer', 'Lung Cancer'],
      licenseNumber: 'MED12345',
      yearsOfExperience: 10,
      education: [
        { degree: 'MD', institution: 'Harvard Medical School', year: 2010 }
      ]
    }
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
    password: 'doctor123',
    role: 'doctor',
    doctorProfile: {
      specialty: 'Cardiology',
      subSpecialties: ['Preventive Cardiology', 'Heart Disease'],
      licenseNumber: 'MED67890',
      yearsOfExperience: 15,
      education: [
        { degree: 'MD', institution: 'Stanford University', year: 2005 }
      ]
    }
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    password: 'doctor123',
    role: 'doctor',
    doctorProfile: {
      specialty: 'Family Medicine',
      licenseNumber: 'MED54321',
      yearsOfExperience: 8,
      education: [
        { degree: 'MD', institution: 'Johns Hopkins University', year: 2012 }
      ]
    }
  },
  
  // Patient users
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: 'patient123',
    role: 'patient',
    patientProfile: {
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      bloodType: 'O+',
      weight: { value: 80, unit: 'kg' },
      height: { value: 178, unit: 'cm' }
    }
  },
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    password: 'patient123',
    role: 'patient',
    patientProfile: {
      dateOfBirth: new Date('1990-08-22'),
      gender: 'female',
      bloodType: 'A+',
      weight: { value: 65, unit: 'kg' },
      height: { value: 165, unit: 'cm' }
    }
  },
  {
    name: 'Robert Davis',
    email: 'robert.davis@example.com',
    password: 'patient123',
    role: 'patient',
    patientProfile: {
      dateOfBirth: new Date('1978-11-03'),
      gender: 'male',
      bloodType: 'B-',
      weight: { value: 90, unit: 'kg' },
      height: { value: 182, unit: 'cm' }
    }
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    password: 'patient123',
    role: 'patient',
    patientProfile: {
      dateOfBirth: new Date('1995-02-28'),
      gender: 'female',
      bloodType: 'AB+',
      weight: { value: 58, unit: 'kg' },
      height: { value: 160, unit: 'cm' }
    }
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    password: 'patient123',
    role: 'patient',
    patientProfile: {
      dateOfBirth: new Date('1965-07-10'),
      gender: 'male',
      bloodType: 'O-',
      weight: { value: 85, unit: 'kg' },
      height: { value: 175, unit: 'cm' }
    }
  }
];

// Function to seed users
async function seedUsers() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Count existing users to check if seeding is necessary
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      console.log(`Database already has ${userCount} users. Do you want to proceed with seeding?`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        readline.question('Proceed? This will NOT delete existing users. (y/n): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Seeding cancelled');
        await mongoose.connection.close();
        return;
      }
    }
    
    console.log('Starting to seed users...');
    let createdCount = 0;
    
    // Process each user
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User with email ${userData.email} already exists. Skipping.`);
        continue;
      }
      
      // Extract profile data
      const { doctorProfile, patientProfile, ...userDataToSave } = userData;
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      userDataToSave.password = await bcrypt.hash(userDataToSave.password, salt);
      userDataToSave.isVerified = true; // All seeded users are verified
      
      // Create user
      const user = await User.create(userDataToSave);
      console.log(`Created user: ${user.name} (${user.role})`);
      createdCount++;
      
      // Create profile based on role
      if (user.role === 'doctor' && doctorProfile) {
        await Doctor.create({
          user: user._id,
          ...doctorProfile
        });
        console.log(`Created doctor profile for: ${user.name}`);
      } else if (user.role === 'patient' && patientProfile) {
        await Patient.create({
          user: user._id,
          ...patientProfile,
          contactInfo: {
            primaryPhone: '+1234567890',
            address: {
              city: 'Example City',
              state: 'Example State',
              country: 'USA'
            }
          }
        });
        console.log(`Created patient profile for: ${user.name}`);
      }
    }
    
    console.log(`Successfully seeded ${createdCount} new users`);
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('User seeding completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error in seeding process:', err);
      process.exit(1);
    });
}

module.exports = seedUsers;
