const express = require('express');
const {
  getCurrentDoctor,
  createUpdateDoctor,
  uploadVerification,
  getPatients,
  getPatientDetails,
  orderTest,
  updateTestResults,
  createPrediction,
  getAppointments,
  updateAppointment
} = require('../controllers/doctors');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);
// Allow only doctors to access these routes
router.use(authorize('doctor'));

router.get('/me', getCurrentDoctor);
router.post('/', createUpdateDoctor);
router.post('/verification', uploadVerification);
router.get('/patients', getPatients);
router.get('/patients/:patientId', getPatientDetails);
router.post('/tests', orderTest);
router.put('/tests/:testId', updateTestResults);
router.post('/predictions', createPrediction);
router.get('/appointments', getAppointments);
router.put('/appointments/:appointmentId', updateAppointment);

module.exports = router;
