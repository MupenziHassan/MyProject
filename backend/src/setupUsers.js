const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    return false;
  }
};

// Define User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add password matching method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

const setupUsers = async () => {
  // Connect to database
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  try {
    // Clear existing users (optional)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Generate hashed passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const doctorPassword = await bcrypt.hash('doctor123', salt);
    const patientPassword = await bcrypt.hash('patient123', salt);

    // Create users with hashed passwords
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });

    const doctorUser = await User.create({
      name: 'Doctor User',
      email: 'doctor@example.com',
      password: doctorPassword,
      role: 'doctor'
    });

    const patientUser = await User.create({
      name: 'Patient User',
      email: 'patient@example.com',
      password: patientPassword,
      role: 'patient'
    });

    console.log('Users created successfully:');
    console.log(`- Admin: admin@example.com / admin123 (ID: ${adminUser._id})`);
    console.log(`- Doctor: doctor@example.com / doctor123 (ID: ${doctorUser._id})`);
    console.log(`- Patient: patient@example.com / patient123 (ID: ${patientUser._id})`);

    // Verify password matching works
    const adminWithPassword = await User.findById(adminUser._id).select('+password');
    const passwordMatches = await adminWithPassword.matchPassword('admin123');
    console.log(`Password matching test: ${passwordMatches ? 'PASSED ✓' : 'FAILED ✗'}`);

  } catch (err) {
    console.error('Error setting up users:', err.message);
  }

  // Close the connection
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the setup function
setupUsers();
