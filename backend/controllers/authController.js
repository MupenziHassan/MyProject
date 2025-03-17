const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, dob, gender, role, doctorDetails } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User with that email already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      dob,
      gender,
      role: role || 'patient'
    });
    
    // Create role specific profile
    if (role === 'patient') {
      await Patient.create({
        userId: user._id,
        address: {},
        emergencyContact: {},
        bloodType: 'Unknown',
        allergies: []
      });
    } else if (role === 'doctor' && doctorDetails) {
      await Doctor.create({
        userId: user._id,
        specialization: doctorDetails.specialization,
        licenseNumber: doctorDetails.licenseNumber,
        experience: doctorDetails.experience || 0,
        languages: ['English'],
        availability: {
          monday: { available: true, slots: [] },
          tuesday: { available: true, slots: [] },
          wednesday: { available: true, slots: [] },
          thursday: { available: true, slots: [] },
          friday: { available: true, slots: [] },
          saturday: { available: false, slots: [] },
          sunday: { available: false, slots: [] }
        }
      });
    }
    
    // Remove password from response
    user.password = undefined;
    
    return res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Check for user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check if account is active
    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: 'Your account is inactive. Please contact support.'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mysecrettoken',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    // Remove password from response
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};
