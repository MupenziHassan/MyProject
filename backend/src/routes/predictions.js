const express = require('express');
const {
  processCancerPrediction,
  getModelVersions,
  providePredictionFeedback
} = require('../controllers/predictions');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Doctor and admin routes
router.post('/cancer', authorize('doctor'), processCancerPrediction);
router.get('/models', authorize('doctor', 'admin'), getModelVersions);
router.post('/:id/feedback', authorize('doctor'), providePredictionFeedback);

module.exports = router;
