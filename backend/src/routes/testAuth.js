const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route - anyone can access
router.get('/public', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public endpoint',
    data: {
      access: 'public'
    }
  });
});

// Protected route - any authenticated user can access
router.get('/protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed a protected endpoint',
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

// Admin route - only admin role can access
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed an admin endpoint',
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      adminAccess: true
    }
  });
});

// Doctor route - only doctor role can access
router.get('/doctor', protect, authorize('doctor'), (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed a doctor endpoint',
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      doctorAccess: true
    }
  });
});

// Patient route - only patient role can access
router.get('/patient', protect, authorize('patient'), (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed a patient endpoint',
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      patientAccess: true
    }
  });
});

module.exports = router;
