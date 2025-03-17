const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Get patient appointments
router.get('/patient', protect, authorize('patient'), async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = { patientId: req.user._id };
    
    // Filter by status if provided
    if (status) {
      query.status = { $in: status.split(',') };
    }
    
    // Get appointments
    const appointments = await Appointment.find(query)
      .sort({ date: 1 })
      .populate({
        path: 'doctorId',
        select: 'name'
      });
    
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
      count: formattedAppointments.length,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching appointments'
    });
  }
});

// Create appointment
router.post('/', protect, async (req, res) => {
  try {
    // If patient is creating appointment
    if (req.user.role === 'patient') {
      req.body.patientId = req.user._id;
    }
    
    const appointment = await Appointment.create(req.body);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating appointment'
    });
  }
});

// Update appointment status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid appointment status'
      });
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating appointment status'
    });
  }
});

module.exports = router;
