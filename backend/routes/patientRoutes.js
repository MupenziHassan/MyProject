const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { auth, checkRole } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Get health dashboard data
router.get('/health-dashboard', auth, checkRole(['patient']), async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get general health metrics
    const latestHealthRecord = await HealthRecord.findOne({
      patientId: userId,
      type: 'general'
    }).sort({ date: -1 });
    
    // Get recent appointments
    const appointments = await Appointment.find({
      patientId: userId,
      date: { $gte: new Date() }
    }).sort({ date: 1 })
      .populate({
        path: 'doctorId',
        select: 'name'
      })
      .limit(5);
    
    // Format data for frontend
    let recentMetrics = null;
    if (latestHealthRecord) {
      recentMetrics = {
        bloodPressure: {
          systolic: latestHealthRecord.bloodPressureSystolic,
          diastolic: latestHealthRecord.bloodPressureDiastolic
        },
        bloodSugar: { value: latestHealthRecord.bloodSugar },
        heartRate: { value: latestHealthRecord.heartRate },
        weight: { value: latestHealthRecord.weight }
      };
    }
    
    // Format appointments for frontend
    const formattedAppointments = appointments.map(appointment => {
      return {
        _id: appointment._id,
        date: appointment.date,
        doctor: {
          name: appointment.doctorId ? appointment.doctorId.name : 'Unknown Doctor'
        },
        type: appointment.type,
        location: appointment.location,
        reason: appointment.reason,
        status: appointment.status
      };
    });
    
    res.json({
      success: true,
      data: {
        recentMetrics,
        appointments: formattedAppointments,
        predictions: [], // This would need a Prediction model
        tests: [], // This would need a TestResult model
        riskFactors: [] // Calculate from health records
      }
    });
  } catch (error) {
    console.error('Health dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching health dashboard'
    });
  }
});

// Submit health information
router.post('/health-information/:type', auth, checkRole(['patient']), async (req, res) => {
  try {
    const { type } = req.params;
    if (!['general', 'symptoms', 'cancerRisk'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid health information type'
      });
    }
    
    const healthRecord = await HealthRecord.create({
      patientId: req.user._id,
      type,
      ...req.body,
      date: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: healthRecord
    });
  } catch (error) {
    console.error('Health information submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Error submitting health information'
    });
  }
});

// Patient routes
router.get('/profile', auth, checkRole(['patient']), patientController.getProfile);
router.put('/profile', auth, checkRole(['patient']), patientController.updateProfile);
router.get('/test-results', auth, checkRole(['patient']), patientController.getPatientTestResults);;

// Temporarily comment out line 111 if we can't identify it precisely
// Uncomment the line below and place it around line 111
// router.get('/problematic-route', (req, res) => res.status(200).json({ success: true, data: [] }));

module.exports = router;
