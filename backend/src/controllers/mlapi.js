const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const ModelVersion = require('../models/ModelVersion');
const MLService = require('../services/MachineLearningService');
const ApiLog = require('../models/ApiLog');
const crypto = require('crypto');

// Helper function to log API requests
const logApiRequest = async (clientId, endpoint, requestType) => {
  await ApiLog.create({
    client: clientId,
    endpoint,
    requestType,
    timestamp: Date.now()
  });
};

// Helper function to anonymize patient data
const anonymizePatientData = (patientData) => {
  // Create a deep copy to avoid modifying the original
  const anonymized = JSON.parse(JSON.stringify(patientData));
  
  // Remove direct identifiers
  delete anonymized.name;
  delete anonymized.email;
  delete anonymized.phone;
  delete anonymized.address;
  delete anonymized.ssn;
  delete anonymized.contactInfo;
  delete anonymized.emergencyContact;
  
  // Anonymize IDs with one-way hash if present
  if (anonymized._id) {
    anonymized._id = crypto
      .createHash('sha256')
      .update(anonymized._id.toString())
      .digest('hex');
  }
  
  if (anonymized.user) {
    anonymized.user = crypto
      .createHash('sha256')
      .update(anonymized.user.toString())
      .digest('hex');
  }
  
  // Keep relevant medical/demographic data for predictions
  return anonymized;
};

// @desc    Receive prediction request from ML service
// @route   POST /api/v1/mlapi/predict
// @access  Private (API Key)
exports.receivePredictionRequest = async (req, res, next) => {
  try {
    const { patientDataHash, predictionRequest, modelVersion } = req.body;
    
    // Log API request
    await logApiRequest(req.apiClient.id, '/predict', 'POST');
    
    // Validate the request data
    if (!patientDataHash || !predictionRequest) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    // Find the prediction request in our database
    const prediction = await Prediction.findOne({ 
      dataHash: patientDataHash,
      status: 'pending'
    }).populate('patient doctor');
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Prediction request not found or already processed'
      });
    }
    
    // Process the prediction result
    prediction.probability = predictionRequest.probability;
    prediction.riskLevel = predictionRequest.riskLevel || calculateRiskLevel(predictionRequest.probability);
    prediction.factors = predictionRequest.factors || [];
    prediction.confidenceInterval = predictionRequest.confidenceInterval;
    prediction.status = 'completed';
    prediction.completedAt = Date.now();
    
    // Save model information
    const model = await ModelVersion.findOne({ version: modelVersion });
    if (model) {
      prediction.modelInfo = {
        name: model.name,
        version: model.version,
        accuracy: model.accuracy,
        lastUpdated: model.lastUpdated
      };
    }
    
    await prediction.save();
    
    // Send notification to doctor and patient (in a real app)
    // notificationService.sendPredictionNotification(prediction);
    
    res.status(200).json({
      success: true,
      data: {
        predictionId: prediction._id,
        status: 'completed'
      }
    });
  } catch (err) {
    console.error('ML API error:', err);
    res.status(500).json({
      success: false,
      error: 'Error processing prediction request'
    });
  }
};

// @desc    Receive model feedback from ML service
// @route   POST /api/v1/mlapi/feedback
// @access  Private (API Key)
exports.receiveFeedback = async (req, res, next) => {
  try {
    const { modelId, metrics } = req.body;
    
    // Log API request
    await logApiRequest(req.apiClient.id, '/feedback', 'POST');
    
    // Validate request
    if (!modelId || !metrics) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    // Update model metrics
    const updatedModel = await ModelVersion.findByIdAndUpdate(
      modelId,
      {
        accuracy: metrics.accuracy || undefined,
        precision: metrics.precision || undefined,
        recall: metrics.recall || undefined,
        f1Score: metrics.f1Score || undefined,
        lastUpdated: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedModel) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        modelId: updatedModel._id,
        version: updatedModel.version,
        lastUpdated: updatedModel.lastUpdated
      }
    });
  } catch (err) {
    console.error('ML API feedback error:', err);
    res.status(500).json({
      success: false,
      error: 'Error processing model feedback'
    });
  }
};

// @desc    Get model metrics
// @route   GET /api/v1/mlapi/models/:modelId/metrics
// @access  Private (API Key)
exports.getModelMetrics = async (req, res, next) => {
  try {
    const { modelId } = req.params;
    
    // Log API request
    await logApiRequest(req.apiClient.id, `/models/${modelId}/metrics`, 'GET');
    
    const model = await ModelVersion.findById(modelId);
    
    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }
    
    // Return only the metrics, not the entire model
    res.status(200).json({
      success: true,
      data: {
        accuracy: model.accuracy,
        precision: model.precision,
        recall: model.recall,
        f1Score: model.f1Score,
        lastUpdated: model.lastUpdated
      }
    });
  } catch (err) {
    console.error('ML API metrics error:', err);
    res.status(500).json({
      success: false,
      error: 'Error retrieving model metrics'
    });
  }
};

// @desc    Submit patient data for prediction
// @route   POST /api/v1/mlapi/submit-data
// @access  Private (Doctors)
exports.submitPatientData = async (req, res, next) => {
  try {
    const { patientId, cancerType } = req.body;
    
    // Check doctor permissions
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: 'Only doctors can submit patient data for predictions'
      });
    }
    
    // Get patient data
    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Anonymize patient data for privacy
    const anonymizedData = anonymizePatientData(patient);
    
    // Generate a hash of the patient data for reference
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(anonymizedData))
      .digest('hex');
    
    // Create prediction record
    const prediction = await Prediction.create({
      patient: patientId,
      doctor: req.user.id,
      condition: `${cancerType} Cancer`,
      cancerType,
      dataHash,
      status: 'pending',
      requestedAt: Date.now()
    });
    
    // Send data to ML service asynchronously
    MLService.submitPredictionJob(anonymizedData, dataHash, cancerType);
    
    res.status(201).json({
      success: true,
      data: {
        predictionId: prediction._id,
        status: 'pending',
        estimatedTime: '30 seconds'
      }
    });
  } catch (err) {
    console.error('Patient data submission error:', err);
    res.status(500).json({
      success: false,
      error: 'Error submitting patient data'
    });
  }
};

// @desc    Get prediction result
// @route   GET /api/v1/mlapi/predictions/:predictionId
// @access  Private (Doctors, Patients)
exports.getPredictionResult = async (req, res, next) => {
  try {
    const { predictionId } = req.params;
    
    const prediction = await Prediction.findById(predictionId);
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Prediction not found'
      });
    }
    
    // Check if user has access to this prediction
    const isPatientOwner = req.user.role === 'patient' && 
                          prediction.patient.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor' && 
                    prediction.doctor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isPatientOwner && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this prediction'
      });
    }
    
    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    console.error('Prediction retrieval error:', err);
    res.status(500).json({
      success: false,
      error: 'Error retrieving prediction'
    });
  }
};

// Helper function to calculate risk level from probability
const calculateRiskLevel = (probability) => {
  if (probability < 0.25) return 'low';
  if (probability < 0.5) return 'moderate';
  if (probability < 0.75) return 'high';
  return 'very high';
};
