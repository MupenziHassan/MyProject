const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const HealthRecord = require('../models/HealthRecord');
const Appointment = require('../models/Appointment');
const Prediction = require('../models/Prediction');
const TestResult = require('../models/TestResult');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Specializations for doctors
const specializations = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Oncology',
  'Gynecology',
  'Family Medicine'
];

const generateUsers = async (count, role) => {
  try {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      const password = await bcrypt.hash('password123', 10);
      const user = new User({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password,
        role,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedUser = await user.save();
      users.push(savedUser);
      
      if (role === 'patient') {
        const patient = new Patient({
          user: savedUser._id,
          healthRecords: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await patient.save();
      } else if (role === 'doctor') {
        const doctor = new Doctor({
          user: savedUser._id,
          specialization: specializations[Math.floor(Math.random() * specializations.length)],
          availability: {
            monday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            tuesday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            wednesday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            thursday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            friday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            saturday: { available: faker.random.boolean(), slots: ['10:00-14:00'] },
            sunday: { available: false, slots: [] }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await doctor.save();
      }
      
      console.log(`Created ${role}: ${savedUser.email}`);
    }
    
    return users;
  } catch (error) {
    console.error(`Error generating ${role}s:`, error);
    throw error;
  }
};

// Create relationships between users (appointments, predictions, test results)
const createRelationships = async (patients, doctors) => {
  try {
    console.log('Creating relationships between users...');
    
    for (const patient of patients) {
      // Each patient gets 1-3 appointments
      const appointmentsCount = faker.datatype.number({ min: 1, max: 3 });
      for (let i = 0; i < appointmentsCount; i++) {
        const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
        const appointment = new Appointment(generateAppointment(patient._id, randomDoctor._id));
        await appointment.save();
      }
      
      // Each patient gets 1-2 predictions
      const predictionsCount = faker.datatype.number({ min: 1, max: 2 });
      for (let i = 0; i < predictionsCount; i++) {
        const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
        const prediction = new Prediction(generatePrediction(patient._id, randomDoctor._id));
        await prediction.save();
      }
      
      // Each patient gets 1-3 test results
      const testsCount = faker.datatype.number({ min: 1, max: 3 });
      for (let i = 0; i < testsCount; i++) {
        const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
        const testResult = new TestResult(generateTestResult(patient._id, randomDoctor._id));
        await testResult.save();
      }
    }
    
    console.log('Relationships created successfully');
  } catch (error) {
    console.error('Error creating relationships:', error);
    throw error;
  }
};

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await mongoose.connection.db.dropDatabase();
    console.log('Existing database dropped');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@healthsystem.com',
      password: adminPassword,
      role: 'admin',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await admin.save();
    console.log('Admin user created:', admin.email);
    
    // Generate patients
    const patients = await generateUsers(20, 'patient');
    
    // Generate doctors
    const doctors = await generateUsers(10, 'doctor');
    
    // Create relationships
    await createRelationships(patients, doctors);
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
