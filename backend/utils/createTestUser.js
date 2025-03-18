const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction';

// Connect to MongoDB
async function createTestUsers() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String
    });

    // Define User model (or use existing one)
    let User;
    try {
      User = mongoose.model('User');
    } catch (error) {
      User = mongoose.model('User', userSchema);
    }
    
    // Create test admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Test admin user created');
    }
    
    // Create test doctor user
    const doctorExists = await User.findOne({ email: 'doctor@example.com' });
    
    if (!doctorExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('doctor123', salt);
      
      await User.create({
        name: 'Doctor User',
        email: 'doctor@example.com',
        password: hashedPassword,
        role: 'doctor'
      });
      console.log('Test doctor user created');
    }
    
    // Create test patient user
    const patientExists = await User.findOne({ email: 'patient@example.com' });
    
    if (!patientExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('patient123', salt);
      
      await User.create({
        name: 'Patient User',
        email: 'patient@example.com',
        password: hashedPassword,
        role: 'patient'
      });
      console.log('Test patient user created');
    }
    
    console.log('All test users created successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
