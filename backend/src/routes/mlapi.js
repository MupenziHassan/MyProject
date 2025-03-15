const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateMLApiKey } = require('../middleware/apiAuth');
const mlController = require('../controllers/mlapi');

// Endpoints accessible only with API key (ML service)
router.post('/predict', validateMLApiKey, mlController.receivePredictionRequest);
router.post('/feedback', validateMLApiKey, mlController.receiveFeedback);
router.get('/models/:modelId/metrics', validateMLApiKey, mlController.getModelMetrics);

// Endpoints accessible by authenticated users (doctors)
router.use(protect);
router.post('/submit-data', mlController.submitPatientData);
router.get('/predictions/:predictionId', mlController.getPredictionResult);

module.exports = router;
