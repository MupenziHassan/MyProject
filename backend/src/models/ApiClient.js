const mongoose = require('mongoose');
const crypto = require('crypto');

const ApiClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  apiKeyHash: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    enum: ['ml_service', 'data_export', 'reporting', 'notifications'],
    default: []
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: null
  },
  ipRestrictions: [String],
  rateLimits: {
    requestsPerMinute: {
      type: Number,
      default: 60
    },
    requestsPerDay: {
      type: Number,
      default: 10000
    }
  }
});

// Generate a new API key (for use when creating a new client)
ApiClientSchema.statics.generateApiKey = function() {
  // Generate a random 32-byte hex string
  const apiKey = crypto.randomBytes(32).toString('hex');
  
  // Hash the key for storage
  const apiKeyHash = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
  
  return { apiKey, apiKeyHash };
};

module.exports = mongoose.model('ApiClient', ApiClientSchema);
