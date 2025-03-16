const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Environment loaded from:', envPath);
}

// Check if MongoDB URI is defined
if (!process.env.MONGO_URI) {
  console.error('MongoDB URI is not defined in environment variables!');
  process.exit(1);
}

// Define the User model schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      mongoose.disconnect();
      return;
    }
    
    // Admin password
    const password = 'admin123';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('Admin user created:');
    console.log({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      id: admin._id
    });
    
    // Create test users for other roles
    const doctorPassword = await bcrypt.hash('doctor123', salt);
    const doctor = await User.create({
      name: 'Doctor User',
      email: 'doctor@example.com',
      password: doctorPassword,
      role: 'doctor'
    });
    
    console.log('Doctor user created');
    
    const patientPassword = await bcrypt.hash('patient123', salt);
    const patient = await User.create({
      name: 'Patient User',
      email: 'patient@example.com',
      password: patientPassword,
      role: 'patient'
    });
    
    console.log('Patient user created');
    
    mongoose.disconnect();
    console.log('Done');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
