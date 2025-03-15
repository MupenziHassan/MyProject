const mongoose = require('mongoose');

const CancerRiskAssessmentSchema = new mongoose.Schema({
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
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  cancerTypes: [{
    type: {
      type: String,
      enum: [
        'breast', 'lung', 'colorectal', 'prostate', 'skin', 
        'lymphoma', 'leukemia', 'liver', 'pancreatic', 'cervical',
        'ovarian', 'testicular', 'bladder', 'kidney', 'thyroid', 
        'other'
      ],
      required: true
    },
    lifetimeRisk: {
      type: Number, // Percentage
      min: 0,
      max: 100
    },
    fiveYearRisk: {
      type: Number, // Percentage
      min: 0,
      max: 100
    },
    tenYearRisk: {
      type: Number, // Percentage
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high'],
      required: true
    },
    riskFactors: [{
      factor: String,
      impact: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      },
      details: String
    }],
    recommendedScreenings: [{
      screeningType: String,
      frequency: String,
      startingAge: Number,
      notes: String
    }]
  }],
  geneticRiskFactors: {
    hasGeneticTesting: Boolean,
    results: [{
      gene: String,
      mutation: String,
      associatedCancers: [String],
      riskIncrease: String
    }],
    familyHistoryScore: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  lifestyleRiskFactors: {
    smokingRisk: {
      type: Number,
      min: 0,
      max: 10
    },
    alcoholRisk: {
      type: Number,
      min: 0,
      max: 10
    },
    dietRisk: {
      type: Number,
      min: 0,
      max: 10
    },
    exerciseRisk: {
      type: Number,
      min: 0,
      max: 10
    },
    bmiRisk: {
      type: Number,
      min: 0,
      max: 10
    },
    environmentalRisk: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  overallRiskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  recommendedActions: [{
    action: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'immediate'],
      default: 'medium'
    },
    timeframe: String,
    details: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'overdue'],
      default: 'pending'
    }
  }],
  modelVersion: String, // Version of the risk assessment model used
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CancerRiskAssessment', CancerRiskAssessmentSchema);
