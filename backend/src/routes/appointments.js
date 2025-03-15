const express = require('express');
const {
  getDoctorAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointmentStatus,
  getDoctorAvailability,
  setDoctorAvailability
} = require('../controllers/appointments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { ensureDoctorPatientRelationship } = require('../middleware/permissions');

// Protect all routes
router.use(protect);

// Doctor routes
router.get('/doctor', authorize('doctor'), getDoctorAppointments);
router.post('/availability', authorize('doctor'), setDoctorAvailability);

// Patient routes
router.get('/patient', authorize('patient'), getPatientAppointments);

// Shared routes
router.post('/', authorize('patient', 'doctor'), createAppointment);
router.put('/:id/status', authorize('patient', 'doctor', 'admin'), updateAppointmentStatus);
router.get('/availability/:doctorId', getDoctorAvailability);

module.exports = router;
