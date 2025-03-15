const mongoose = require('mongoose');

const ModelVersionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true
  },
  version: {
    type: String,
    required: [true, 'Version is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['cancer', 'cardiovascular', 'diabetes', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['active', 'deprecated', 'testing'],
    default: 'testing'
  },
  description: {
    type: String,
    trim: true
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
  parameters: {
    type: Object,
    default: {}
  },
  apiEndpoint: {
    type: String,
    trim: true
  },
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

module.exports = mongoose.model('ModelVersion', ModelVersionSchema);
