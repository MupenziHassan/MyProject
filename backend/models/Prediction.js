const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  condition: {
    type: String,
    required: true
  },
  probability: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very high'],
    required: true
  },
  factors: [{
    name: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    description: String
  }],
  recommendations: [String],
  notes: String,
  modelInfo: {
    name: String,
    version: String,
    accuracy: Number,
    lastUpdated: Date
  },
  cancerType: String,
  confidenceInterval: {
    lower: Number,
    upper: Number
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'reviewed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to determine if risk level is high or very high
PredictionSchema.virtual('isHighRisk').get(function() {
  return ['high', 'very high'].includes(this.riskLevel);
});

module.exports = mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);
