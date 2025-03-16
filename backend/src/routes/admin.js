const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
// Since the actual controller might not exist yet, we'll create a basic placeholder
const adminController = {
  getDashboardStats: (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: 54,
          patients: 42,
          doctors: 10,
          admins: 2,
          growth: 5.2
        },
        predictions: {
          total: 128,
          highRisk: 18,
          highRiskPercentage: 14.1,
          accuracy: 0.84
        },
        tests: {
          total: 256,
          completed: 245
        }
      }
    });
  },
  getDoctorVerifications: (req, res) => {
    res.status(200).json({
      success: true,
      data: []
    });
  },
  getUsers: (req, res) => {
    res.status(200).json({
      success: true,
      data: []
    });
  }
};

// All admin routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);

// Doctor verification routes
router.get('/verifications', adminController.getDoctorVerifications);

// User management routes
router.get('/users', adminController.getUsers);

module.exports = router;
