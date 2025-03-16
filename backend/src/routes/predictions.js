const express = require('express');
const {
  processCancerPrediction,
  getModelVersions,
  providePredictionFeedback
} = require('../controllers/predictions');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Simple placeholder predictions controller
const predictionsController = {
  // Get all predictions for user
  getPredictions: (req, res) => {
    res.status(200).json({
      success: true,
      data: []
    });
  },
  
  // Get single prediction
  getPrediction: (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        _id: req.params.id,
        condition: 'Sample Condition',
        riskLevel: 'low',
        probability: 0.2,
        date: new Date()
      }
    });
  },
  
  // Create prediction
  createPrediction: (req, res) => {
    res.status(201).json({
      success: true,
      data: {
        _id: 'new-prediction-id',
        ...req.body,
        date: new Date()
      }
    });
  }
};

// Protect all routes
router.use(protect);

// Doctor and admin routes
router.post('/cancer', authorize('doctor'), processCancerPrediction);
router.get('/models', authorize('doctor', 'admin'), getModelVersions);
router.post('/:id/feedback', authorize('doctor'), providePredictionFeedback);

// Patient routes - get their own predictions
router.route('/')
  .get(protect, predictionsController.getPredictions);
  
router.route('/:id')
  .get(protect, predictionsController.getPrediction);

// Doctor routes - create predictions
router.route('/')
  .post(protect, authorize('doctor'), predictionsController.createPrediction);

module.exports = router;
