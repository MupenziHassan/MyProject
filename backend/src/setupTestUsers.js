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

// User schema for direct creation
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  password: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

const setupUsers = async () => {
  // Connect to database
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  try {
    // Clear existing users 
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user with direct password hash
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });

    // Create doctor user
    const doctorUser = await User.create({
      name: 'Doctor User',
      email: 'doctor@example.com',
      password: await bcrypt.hash('doctor123', 10),
      role: 'doctor'
    });

    // Create patient user
    const patientUser = await User.create({
      name: 'Patient User',
      email: 'patient@example.com',
      password: await bcrypt.hash('patient123', 10), 
      role: 'patient'
    });

    console.log('Users created successfully:');
    console.log(`- Admin: admin@example.com / admin123 (ID: ${adminUser._id})`);
    console.log(`- Doctor: doctor@example.com / doctor123 (ID: ${doctorUser._id})`);
    console.log(`- Patient: patient@example.com / patient123 (ID: ${patientUser._id})`);

    // Test password verification
    try {
      const testAdmin = await User.findById(adminUser._id);
      const passwordMatch = await bcrypt.compare('admin123', testAdmin.password);
      console.log(`Password verification test: ${passwordMatch ? 'PASSED ✓' : 'FAILED ✗'}`);
    } catch (err) {
      console.error('Password verification test failed:', err);
    }

  } catch (err) {
    console.error('Error setting up users:', err);
  }

  // Close the connection
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the setup function
setupUsers();
