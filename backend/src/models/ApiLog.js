const mongoose = require('mongoose');

const ApiLogSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiClient',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  requestType: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    required: true
  },
  statusCode: {
    type: Number
  },
  responseTime: {
    type: Number // in milliseconds
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  errorMessage: {
    type: String
  }
});

// Index for faster querying
ApiLogSchema.index({ client: 1, timestamp: -1 });
ApiLogSchema.index({ endpoint: 1, timestamp: -1 });

module.exports = mongoose.model('ApiLog', ApiLogSchema);
