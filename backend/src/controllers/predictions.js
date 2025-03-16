// Import dependencies with graceful handling
const User = require('../models/User');
const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
let NotificationService;

try {
  NotificationService = require('../services/NotificationService');
} catch (error) {
  console.warn('NotificationService not available:', error.message);
  // Create a mock notification service
  NotificationService = {
    sendPredictionNotification: () => Promise.resolve({ success: false })
  };
}

const ModelVersion = require('../models/ModelVersion');
const MLService = require('../services/MachineLearningService');

// @desc    Process cancer prediction request
// @route   POST /api/v1/predictions/cancer
// @access  Private (Doctor)
exports.processCancerPrediction = async (req, res, next) => {
  try {
    const { patientId, testData, modelVersion } = req.body;
    
    // Validate patient exists and user has access
    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Get patient user for notifications
    const patientUser = await User.findById(patientId);
    if (!patientUser) {
      return res.status(404).json({
        success: false,
        error: 'Patient user not found'
      });
    }
    
    // Process prediction with ML service
    const predictionResult = await MLService.getCancerPrediction(testData, modelVersion);
    
    // Create prediction record
    const prediction = await Prediction.create({
      test: req.body.testId || null,
      patient: patientId,
      doctor: req.user.id,
      condition: 'Cancer',
      probability: predictionResult.prediction.probability,
      riskLevel: calculateRiskLevel(predictionResult.prediction.probability),
      factors: predictionResult.prediction.factors || [],
      recommendations: predictionResult.prediction.recommendations || [],
      notes: req.body.notes || '',
      modelInfo: predictionResult.modelInfo
    });
    
    // Send notification to patient
    await NotificationService.sendPredictionNotification(
      patientUser,
      prediction,
      req.user // doctor
    );
    
    res.status(201).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all model versions
// @route   GET /api/v1/predictions/models
// @access  Private (Doctor, Admin)
exports.getModelVersions = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    // Filter by category if provided
    const query = {};
    if (category) {
      query.category = category;
    }
    
    const models = await ModelVersion.find(query).sort({ category: 1, status: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: models.length,
      data: models
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Provide feedback on prediction accuracy
// @route   POST /api/v1/predictions/:id/feedback
// @access  Private (Doctor)
exports.providePredictionFeedback = async (req, res, next) => {
  try {
    const { wasCorrect, actualDiagnosis, notes } = req.body;
    
    // Find the prediction
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Prediction not found'
      });
    }
    
    // Update prediction with feedback
    prediction.feedback = {
      wasCorrect,
      actualDiagnosis,
      notes,
      providedBy: req.user.id,
      providedAt: new Date()
    };
    
    await prediction.save();
    
    // Track prediction accuracy for model improvement
    if (prediction.modelInfo && prediction.modelInfo.version) {
      const model = await ModelVersion.findOne({
        version: prediction.modelInfo.version,
        category: 'cancer'
      });
      
      if (model) {
        await MLService.trackPredictionAccuracy(
          model._id,
          {
            probability: prediction.probability,
            condition: prediction.condition,
            riskLevel: prediction.riskLevel
          },
          wasCorrect
        );
      }
    }
    
    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to calculate risk level based on probability
const calculateRiskLevel = (probability) => {
  if (probability < 0.25) return 'low';
  if (probability < 0.5) return 'moderate';
  if (probability < 0.75) return 'high';
  return 'very high';
};
