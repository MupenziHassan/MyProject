const axios = require('axios');
const ModelVersion = require('../models/ModelVersion');

/**
 * Service for handling machine learning model interactions
 */
class MachineLearningService {
  /**
   * Create an instance of the ML service
   */
  constructor() {
    this.baseUrl = process.env.ML_API_URL || 'https://ml-api.healthprediction.com';
    this.apiKey = process.env.ML_API_KEY;
  }

  /**
   * Get active model for a specific category
   * 
   * @param {string} category - The model category (cancer, cardiovascular, etc.)
   * @returns {Promise<Object>} The active model information
   */
  async getActiveModel(category) {
    try {
      const model = await ModelVersion.findOne({ 
        category, 
        status: 'active' 
      }).sort({ createdAt: -1 });
      
      return model;
    } catch (err) {
      throw new Error(`Failed to get active model: ${err.message}`);
    }
  }

  /**
   * Get prediction for cancer diagnosis
   * 
   * @param {Object} patientData - Patient data used for prediction
   * @param {string} modelVersion - Optional model version to use
   * @returns {Promise<Object>} The prediction results
   */
  async getCancerPrediction(patientData, modelVersion = null) {
    try {
      // Get active model for cancer predictions
      const model = modelVersion ? 
        await ModelVersion.findOne({ version: modelVersion, category: 'cancer' }) :
        await this.getActiveModel('cancer');
      
      if (!model) {
        throw new Error('No active cancer prediction model found');
      }

      // Format patient data for the ML API
      const formattedData = this.formatPatientDataForML(patientData);
      
      // Call the ML API with the formatted data
      const response = await axios.post(
        `${this.baseUrl}/api/predict/cancer`,
        {
          modelVersion: model.version,
          patientData: formattedData
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      // The ML API returns a prediction result
      const predictionResult = response.data;
      
      // Additional processing/validation of the prediction result
      this.validatePredictionResult(predictionResult);
      
      // Return the prediction with metadata
      return {
        prediction: predictionResult,
        modelInfo: {
          name: model.name,
          version: model.version,
          accuracy: model.accuracy,
          lastUpdated: model.lastUpdated
        },
        timestamp: new Date()
      };
    } catch (err) {
      console.error('Cancer prediction error:', err);
      throw new Error(`Cancer prediction failed: ${err.message}`);
    }
  }

  // Format patient data for ML API consumption
  formatPatientDataForML(patientData) {
    // Extract and transform relevant features
    // This depends on what the ML model expects
    const formattedData = {
      demographics: {
        age: patientData.age,
        gender: patientData.gender,
        ethnicity: patientData.ethnicity
      },
      clinicalFeatures: {
        // Extract clinical measurements/test results
        bloodMarkers: patientData.bloodMarkers || {},
        imagingResults: patientData.imagingResults || {},
        symptoms: patientData.symptoms || []
      },
      medicalHistory: patientData.medicalHistory || [],
      familyHistory: patientData.familyHistory || [],
      lifestyle: patientData.lifestyle || {}
    };
    
    return formattedData;
  }

  // Validate prediction results
  validatePredictionResult(result) {
    // Ensure prediction has required fields
    if (!result || typeof result.probability !== 'number') {
      throw new Error('Invalid prediction result format');
    }
    
    // Ensure probability is between 0 and 1
    if (result.probability < 0 || result.probability > 1) {
      throw new Error('Invalid prediction probability value');
    }
    
    return true;
  }

  /**
   * Track the accuracy of a prediction (for model improvement)
   * 
   * @param {string} modelId - The model ID
   * @param {Object} prediction - The prediction that was made
   * @param {boolean} wasCorrect - Whether the prediction was correct
   * @returns {Promise<Object>} Updated accuracy statistics
   */
  async trackPredictionAccuracy(modelId, prediction, wasCorrect) {
    try {
      // Log the prediction accuracy for model tracking
      const result = await axios.post(
        `${this.baseUrl}/api/track-accuracy`,
        {
          modelId,
          prediction,
          wasCorrect,
          timestamp: new Date()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return result.data;
    } catch (err) {
      throw new Error(`Failed to track prediction accuracy: ${err.message}`);
    }
  }

  /**
   * Register a new model version in the system
   * 
   * @param {Object} modelData - The model information to register
   * @returns {Promise<Object>} The registered model
   */
  async registerModelVersion(modelData) {
    try {
      const newModel = await ModelVersion.create(modelData);
      return newModel;
    } catch (err) {
      throw new Error(`Failed to register model version: ${err.message}`);
    }
  }

  /**
   * Update model metrics based on validation results
   * 
   * @param {string} modelId - The model ID to update
   * @param {Object} metrics - The metrics to update (accuracy, precision, etc.)
   * @returns {Promise<Object>} The updated model
   */
  async updateModelMetrics(modelId, metrics) {
    try {
      const updatedModel = await ModelVersion.findByIdAndUpdate(
        modelId,
        { 
          ...metrics,
          lastUpdated: new Date()
        },
        { new: true }
      );
      
      return updatedModel;
    } catch (err) {
      throw new Error(`Failed to update model metrics: ${err.message}`);
    }
  }
}

module.exports = new MachineLearningService();
