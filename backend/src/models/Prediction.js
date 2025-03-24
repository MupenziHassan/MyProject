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
  predictionType: {
    type: String,
    enum: [
      'cancer_risk', 
      'diabetes_risk', 
      'heart_disease_risk', 
      'stroke_risk', 
      'mental_health',
      'custom'
    ],
    required: true
  },
  // For custom prediction types
  customType: String,
  // ML Model details
  model: {
    version: {
      type: String,
      required: true
    },
    name: String,
    description: String
  },
  // Input features/data used for the prediction
  inputData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Prediction results
  result: {
    prediction: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    probability: {
      type: Number,
      min: 0,
      max: 1
    },
    confidenceInterval: {
      lower: Number,
      upper: Number
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high', 'inconclusive'],
      required: true
    },
    interpretation: String
  },
  // Top factors influencing the prediction
  contributingFactors: [{
    factor: String,
    weight: Number,
    description: String
  }],
  // Recommended actions based on the prediction
  recommendations: [{
    category: {
      type: String,
      enum: ['lifestyle', 'screening', 'medication', 'specialist_referral', 'monitoring', 'other']
    },
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    timeframe: String
  }],
  // Medical professional's feedback on the prediction
  clinicalAssessment: {
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assessmentDate: Date,
    agreementLevel: {
      type: String,
      enum: ['agrees', 'partially_agrees', 'disagrees', 'uncertain']
    },
    notes: String,
    override: {
      isOverridden: Boolean,
      reason: String,
      newRiskLevel: {
        type: String,
        enum: ['low', 'moderate', 'high', 'very_high', 'inconclusive']
      }
    }
  },
  // For tracking follow-up actions
  followUpActions: [{
    type: {
      type: String,
      enum: ['appointment', 'test', 'screening', 'medication', 'referral', 'other']
    },
    status: {
      type: String,
      enum: ['recommended', 'scheduled', 'completed', 'declined']
    },
    dueDate: Date,
    completedDate: Date,
    notes: String,
    relatedRecord: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'followUpActions.recordType'
    },
    recordType: {
      type: String,
      enum: ['Appointment', 'MedicalRecord', 'Test']
    }
  }],
  // Notifications sent about this prediction
  notifications: [{
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date,
    channel: {
      type: String,
      enum: ['email', 'sms', 'push', 'in-app']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed']
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'error', 'reviewed', 'archived'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to update the updatedAt field
PredictionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtuals
PredictionSchema.virtual('isRecent').get(function() {
  const now = new Date();
  const createdAt = new Date(this.createdAt);
  const diffTime = Math.abs(now - createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7; // Prediction is recent if created within the last 7 days
});

PredictionSchema.virtual('requiresReview').get(function() {
  return this.status === 'completed' && !this.clinicalAssessment;
});

// Indexes
PredictionSchema.index({ patient: 1, createdAt: -1 });
PredictionSchema.index({ doctor: 1, createdAt: -1 });
PredictionSchema.index({ predictionType: 1, 'result.riskLevel': 1 });
PredictionSchema.index({ status: 1 });

module.exports = mongoose.model('Prediction', PredictionSchema);
