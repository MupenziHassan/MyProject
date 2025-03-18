const express = require('express');
const router = express.Router();

// Hardcoded demo users for presentation
const users = [
  { id: 1, name: 'Doctor User', email: 'doctor@example.com', password: 'doctor123', role: 'doctor' },
  { id: 2, name: 'Patient User', email: 'patient@example.com', password: 'patient123', role: 'patient' },
  { id: 3, name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' }
];

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}`);
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    // Check credentials
    if (!user || user.password !== password) {
      console.log('Login failed: Invalid credentials');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Create simple token
    const token = `demo-token-${user.id}-${Date.now()}`;
    
    // Return success with user data (excluding password)
    const { password: _, ...userData } = user;
    
    res.json({
      success: true,
      token,
      data: {
        user: userData
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`Register attempt: ${email}`);
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        error: 'User with that email already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      role: role || 'patient'
    };
    
    users.push(newUser);
    
    // Create token
    const token = `demo-token-${newUser.id}-${Date.now()}`;
    
    // Return success with user data (excluding password)
    const { password: _, ...userData } = newUser;
    
    res.status(201).json({
      success: true,
      token,
      data: {
        user: userData
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
