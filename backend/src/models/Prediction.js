const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  condition: {
    type: String,
    required: [true, 'Condition name is required']
  },
  cancerType: {
    type: String,
    enum: [
      'breast', 'lung', 'colorectal', 'prostate', 'skin', 
      'lymphoma', 'leukemia', 'liver', 'pancreatic', 'cervical',
      'ovarian', 'testicular', 'bladder', 'kidney', 'thyroid', 
      'other', 'unknown'
    ]
  },
  probability: {
    type: Number,
    required: [true, 'Prediction probability is required'],
    min: 0,
    max: 1
  },
  confidenceInterval: {
    lower: {
      type: Number,
      min: 0,
      max: 1
    },
    upper: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very high'],
    required: true
  },
  factors: [{
    name: String,
    weight: Number,
    description: String,
    category: {
      type: String,
      enum: ['genetic', 'lifestyle', 'medical_history', 'age', 'gender', 'test_result', 'other']
    }
  }],
  protectiveFactors: [{
    name: String,
    weight: Number,
    description: String
  }],
  recommendations: [{
    category: {
      type: String,
      enum: ['lifestyle', 'screening', 'medication', 'further_testing', 'specialist', 'monitoring', 'other']
    },
    description: String,
    priority: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'moderate'
    },
    timeframe: String // e.g., "Within 2 weeks", "Immediately"
  }],
  notes: {
    type: String
  },
  modelInfo: {
    name: String,
    version: String,
    accuracy: Number,
    lastUpdated: Date
  },
  feedback: {
    wasCorrect: Boolean,
    actualDiagnosis: String,
    notes: String,
    providedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    providedAt: Date
  },
  followUps: [{
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed'],
      default: 'pending'
    },
    completedDate: Date,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster querying
PredictionSchema.index({ patient: 1, createdAt: -1 });
PredictionSchema.index({ doctor: 1, createdAt: -1 });
PredictionSchema.index({ condition: 1, riskLevel: 1 });

module.exports = mongoose.model('Prediction', PredictionSchema);
