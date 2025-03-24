const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes - only accessible to authenticated doctors
router.use(protect);
router.use(authorize('doctor'));

// Dashboard
router.get('/dashboard', doctorController.getDashboardData);

// Patients
router.get('/patients', doctorController.getPatients);
router.post('/patients', doctorController.createPatient);
router.get('/patients/:patientId', doctorController.getPatientById);

// Appointments
router.get('/appointments', doctorController.getAppointments);
router.get('/appointments/:appointmentId', doctorController.getAppointmentById);
router.put('/appointments/:appointmentId', doctorController.updateAppointment);

// Assessments
router.get('/assessments', doctorController.getAssessments);
router.post('/assessments', doctorController.createAssessment);
router.get('/assessments/:assessmentId', doctorController.getAssessmentById);
router.put('/assessments/:assessmentId/verify', doctorController.verifyAssessment);

module.exports = router;
