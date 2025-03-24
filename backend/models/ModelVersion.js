const mongoose = require('mongoose');

const ModelVersionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['cancer', 'diabetes', 'heart', 'general', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['development', 'testing', 'active', 'deprecated', 'retired'],
    default: 'development'
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 1
  },
  precision: {
    type: Number,
    min: 0,
    max: 1
  },
  recall: {
    type: Number,
    min: 0,
    max: 1
  },
  f1Score: {
    type: Number,
    min: 0,
    max: 1
  },
  apiEndpoint: String,
  description: String,
  trainingData: {
    source: String,
    size: Number,
    dateRange: {
      start: Date,
      end: Date
    }
  },
  parameters: mongoose.Schema.Types.Mixed,
  releaseNotes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update lastUpdated timestamp
ModelVersionSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('ModelVersion', ModelVersionSchema);
