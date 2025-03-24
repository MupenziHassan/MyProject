const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Load environment variables
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No .env file found. Using default settings.');
  // Set default MONGO_URI if no .env file is found
  process.env.MONGO_URI = 'mongodb://localhost:27017/health-prediction-dev';
}

// Define schemas for all required collections
const schemas = {
  users: new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    createdAt: { type: Date, default: Date.now }
  }),
  
  patients: new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfBirth: Date,
    gender: String,
    bloodType: String,
    contactInfo: {
      primaryPhone: String,
      address: {
        city: String,
        state: String,
        country: String
      }
    },
    medicalHistory: [{
      condition: String,
      diagnosedDate: Date,
      status: String
    }],
    createdAt: { type: Date, default: Date.now }
  }),
  
  doctors: new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: String,
    licenseNumber: String,
    experience: Number,
    isVerified: Boolean,
    contactNumber: String,
    qualifications: [{
      degree: String,
      institution: String,
      year: Number
    }],
    createdAt: { type: Date, default: Date.now }
  }),
  
  predictions: new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modelVersion: { type: String },
    predictionType: { type: String, required: true },
    inputData: { type: Object },
    result: { type: Object },
    confidence: { type: Number },
    createdAt: { type: Date, default: Date.now }
  }),
  
  modelVersions: new mongoose.Schema({
    name: { type: String, required: true },
    version: { type: String, required: true },
    category: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'testing'] },
    accuracy: { type: Number },
    precision: { type: Number },
    recall: { type: Number },
    apiEndpoint: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }),
  
  appointments: new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateTime: { type: Date, required: true },
    duration: { type: Number, default: 30 }, // in minutes
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'], 
      default: 'scheduled' 
    },
    type: { type: String, enum: ['consultation', 'followup', 'emergency'] },
    notes: String,
    createdAt: { type: Date, default: Date.now }
  }),
  
  tests: new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    description: String,
    status: { 
      type: String, 
      enum: ['ordered', 'collected', 'processing', 'completed', 'cancelled'],
      default: 'ordered'
    },
    results: Object,
    orderedDate: { type: Date, default: Date.now },
    completedDate: Date,
    notes: String
  })
};

// Define test data for initialization
const testData = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed before insertion
      role: 'admin'
    },
    {
      name: 'Doctor User',
      email: 'doctor@example.com',
      password: 'doctor123', // Will be hashed before insertion
      role: 'doctor'
    },
    {
      name: 'Patient User',
      email: 'patient@example.com',
      password: 'patient123', // Will be hashed before insertion
      role: 'patient'
    }
  ]
};

// Initialize database
async function initDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Define models for required collections
    const models = {};
    for (const [name, schema] of Object.entries(schemas)) {
      try {
        // Try to get existing model
        models[name] = mongoose.model(name);
        console.log(`Using existing model: ${name}`);
      } catch (error) {
        // Model doesn't exist, register new model
        models[name] = mongoose.model(name, schema);
        console.log(`Registered new model: ${name}`);
      }
    }

    // Check if collections exist and collections are empty
    console.log('Checking collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Available collections:', collectionNames.join(', ') || 'none');

    // Create test users if the users collection is empty
    const usersCount = await models.users.countDocuments();
    if (usersCount === 0) {
      console.log('Users collection is empty. Creating test users...');
      
      // Hash passwords before insertion
      for (const user of testData.users) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      
      // Insert test users
      await models.users.insertMany(testData.users);
      console.log(`Created ${testData.users.length} test users`);
      
      // Create associated doctor and patient profiles
      const admin = await models.users.findOne({ email: 'admin@example.com' });
      const doctor = await models.users.findOne({ email: 'doctor@example.com' });
      const patient = await models.users.findOne({ email: 'patient@example.com' });
      
      // Create doctor profile
      await models.doctors.create({
        user: doctor._id,
        specialization: 'Oncology',
        licenseNumber: 'MED12345',
        experience: 10,
        isVerified: true,
        contactNumber: '+1234567890',
        qualifications: [{
          degree: 'MD',
          institution: 'Harvard Medical School',
          year: 2010
        }]
      });
      console.log('Created doctor profile');
      
      // Create patient profile
      await models.patients.create({
        user: patient._id,
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        bloodType: 'O+',
        contactInfo: {
          primaryPhone: '+1123456789',
          address: {
            city: 'Boston',
            state: 'MA',
            country: 'USA'
          }
        },
        medicalHistory: [{
          condition: 'Hypertension',
          diagnosedDate: new Date('2018-03-10'),
          status: 'managed'
        }]
      });
      console.log('Created patient profile');
      
      // Create model versions
      await models.modelVersions.create({
        name: 'Breast Cancer Risk Predictor',
        version: 'v1.0',
        category: 'cancer',
        status: 'active',
        accuracy: 0.85,
        precision: 0.87,
        recall: 0.83,
        apiEndpoint: '/api/predict/breast-cancer',
        createdBy: admin._id
      });
      console.log('Created model versions');
    } else {
      console.log(`Users collection already has ${usersCount} documents`);
    }

    // Create indexes for better performance
    console.log('Creating indexes...');
    await models.users.collection.createIndex({ email: 1 }, { unique: true });
    await models.patients.collection.createIndex({ user: 1 }, { unique: true });
    await models.doctors.collection.createIndex({ user: 1 }, { unique: true });
    await models.appointments.collection.createIndex({ patient: 1, dateTime: 1 });
    await models.appointments.collection.createIndex({ doctor: 1, dateTime: 1 });
    await models.predictions.collection.createIndex({ patient: 1, createdAt: -1 });
    
    console.log('Database initialization completed successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error: error.message };
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initDatabase()
    .then(result => {
      console.log('Initialization result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error during initialization:', error);
      process.exit(1);
    });
} else {
  // Export for use in other modules
  module.exports = initDatabase;
}
