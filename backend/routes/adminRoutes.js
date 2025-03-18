const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');

// Middleware to ensure admin access
const adminAuth = async (req, res, next) => {
  try {
    // Get user from auth middleware
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin rights required.'
      });
    }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    // Exclude password from results
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get user by ID
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Create new user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with that email already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'patient'
    });
    
    // Remove password from response
    user.password = undefined;
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Find user
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    
    // Update password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    // Remove password from response
    user.password = undefined;
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    await user.remove();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Get user counts
    const totalUsers = await User.countDocuments();
    const patientCount = await User.countDocuments({ role: 'patient' });
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    // Mock appointment data (replace with real data later)
    const appointmentStats = {
      total: 78,
      completed: 45,
      upcoming: 23,
      canceled: 10
    };
    
    // Mock recent activity (replace with real data later)
    const recentActivity = [
      { type: 'New User', details: 'Patient John Doe registered', time: '2 hours ago' },
      { type: 'Appointment', details: 'Dr. Smith completed appointment with Patient #12', time: '3 hours ago' },
      { type: 'Prediction', details: 'New health prediction for Patient #23', time: '5 hours ago' },
      { type: 'System', details: 'Database backup completed', time: '1 day ago' }
    ];
    
    res.json({
      success: true,
      data: {
        userCounts: {
          total: totalUsers,
          patients: patientCount,
          doctors: doctorCount,
          admin: adminCount
        },
        appointments: appointmentStats,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get system settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    // Mock settings data for presentation
    const settings = {
      general: {
        systemName: 'Health Prediction System',
        contactEmail: 'support@healthsystem.com',
        maintenanceMode: false,
        allowRegistration: true
      },
      email: {
        smtpHost: 'smtp.example.com',
        smtpPort: '587',
        smtpUser: 'user@example.com',
        smtpPassword: '', // Don't return actual password
        emailFrom: 'noreply@healthsystem.com',
        emailFromName: 'Health Prediction System'
      },
      security: {
        passwordMinLength: 8,
        passwordRequireNumbers: true,
        passwordRequireSymbols: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5
      }
    };
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update system settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    // In a real application, you would save these settings to the database
    console.log('Settings update received:', req.body);
    
    // Just return success for the demo
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Test email configuration
router.post('/settings/test-email', adminAuth, async (req, res) => {
  try {
    // In a real application, you would actually send a test email
    console.log('Email test requested with config:', req.body);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    });
  }
});

module.exports = router;
