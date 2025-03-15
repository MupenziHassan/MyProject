const express = require('express');
const {
  getCurrentPatient,
  createUpdatePatient,
  getPatientTests,
  getPatientPredictions,
  addMedicalHistory,
  addAllergy,
  addFamilyHistory,
  updateLifestyle
} = require('../controllers/patients');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);
// Allow only patients to access these routes
router.use(authorize('patient'));

router.get('/me', getCurrentPatient);
router.post('/', createUpdatePatient);
router.get('/tests', getPatientTests);
router.get('/predictions', getPatientPredictions);
router.post('/medical-history', addMedicalHistory);
router.post('/allergies', addAllergy);
router.post('/family-history', addFamilyHistory);
router.put('/lifestyle', updateLifestyle);

module.exports = router;
