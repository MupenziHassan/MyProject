const crypto = require('crypto');
const ApiClient = require('../models/ApiClient');

/**
 * Middleware to validate ML service API key
 */
const validateMLApiKey = async (req, res, next) => {
  try {
    // Check if API key is provided in headers
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required'
      });
    }
    
    // Hash the API key for comparison
    const hashedApiKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
    
    // Find client with matching API key
    const apiClient = await ApiClient.findOne({ 
      apiKeyHash: hashedApiKey,
      isActive: true
    });
    
    if (!apiClient) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive API key'
      });
    }
    
    // Check if client has ML service permissions
    if (!apiClient.permissions.includes('ml_service')) {
      return res.status(403).json({
        success: false,
        error: 'API key does not have ML service permissions'
      });
    }
    
    // Update last used timestamp
    apiClient.lastUsed = Date.now();
    await apiClient.save();
    
    // Add client info to request object for later use
    req.apiClient = {
      id: apiClient._id,
      name: apiClient.name,
      permissions: apiClient.permissions
    };
    
    next();
  } catch (err) {
    console.error('API authentication error:', err);
    return res.status(500).json({
      success: false,
      error: 'API authentication error'
    });
  }
};

module.exports = {
  validateMLApiKey
};
