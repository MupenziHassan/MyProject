const mongoose = require('mongoose');

const HealthAssessmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentType: {
    type: String,
    enum: [
      'general_health', 'cancer_risk', 'heart_disease_risk', 
      'diabetes_risk', 'mental_health', 'lifestyle', 'custom'
    ],
    required: true
  },
  customType: String, // Used when assessmentType is 'custom'
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true
  },
  description: String,
  // The person administering the assessment
  administrator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Date and time assessment was taken
  assessmentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Questions and responses
  questions: [{
    questionId: {
      type: String,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple_choice', 'yes_no', 'scale', 'text', 'numeric', 'date', 'checkbox'],
      required: true
    },
    options: [String], // For multiple choice questions
    required: {
      type: Boolean,
      default: true
    },
    category: String, // For grouping related questions
    response: mongoose.Schema.Types.Mixed, // The patient's answer
    skipped: Boolean,
    responseDate: Date // When the question was answered
  }],
  // Assessment results and scoring
  results: {
    score: Number, // Numerical score if applicable
    maxPossibleScore: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high', 'inconclusive']
    },
    interpretation: String,
    riskFactors: [{
      factor: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      description: String
    }],
    protectiveFactors: [{
      factor: String,
      impact: {
        type: String,
        enum: ['mild', 'moderate', 'significant']
      },
      description: String
    }]
  },
  // Recommendations based on assessment
  recommendations: [{
    category: {
      type: String,
      enum: ['lifestyle', 'screening', 'referral', 'monitoring', 'education', 'intervention']
    },
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    actionNeeded: Boolean,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date
  }],
  // If assessment was reviewed by a healthcare provider
  clinicalReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    notes: String,
    agreementLevel: {
      type: String,
      enum: ['agrees', 'partially_agrees', 'disagrees', 'uncertain']
    },
    override: {
      isOverridden: Boolean,
      reason: String,
      newRiskLevel: {
        type: String,
        enum: ['low', 'moderate', 'high', 'very_high', 'inconclusive']
      }
    }
  },
  // Follow-up actions
  followUp: {
    recommended: Boolean,
    type: {
      type: String,
      enum: ['appointment', 'test', 'screening', 'self_monitoring', 'reassessment']
    },
    dueDate: Date,
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    notes: String
  },
  // Completion status
  completionStatus: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned', 'pending_review'],
    default: 'in_progress'
  },
  // Duration to complete assessment
  duration: {
    startTime: Date,
    endTime: Date,
    timeSpentMinutes: Number
  },
  // Flags for urgent attention
  flags: {
    needsUrgentAttention: Boolean,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: Date,
    flagReason: String,
    resolved: Boolean,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // For tracking related records
  relatedRecords: [{
    recordType: {
      type: String,
      enum: ['MedicalRecord', 'Appointment', 'Test', 'Prediction', 'TreatmentPlan']
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  // Feedback about the assessment
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    providedAt: Date
  },
  // For comparison with previous assessments
  previousAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthAssessment'
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

// Middleware to update updatedAt field
HealthAssessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to calculate time spent on assessment if both start and end times are available
HealthAssessmentSchema.pre('save', function(next) {
  if (this.duration.startTime && this.duration.endTime) {
    const startTime = new Date(this.duration.startTime);
    const endTime = new Date(this.duration.endTime);
    
    const diffMs = endTime - startTime;
    this.duration.timeSpentMinutes = Math.round(diffMs / 60000); // Convert to minutes
  }
  next();
});

// Virtuals
HealthAssessmentSchema.virtual('completionPercentage').get(function() {
  if (!this.questions || this.questions.length === 0) return 0;
  
  const answeredQuestions = this.questions.filter(q => 
    q.response !== undefined && q.response !== null && !q.skipped
  ).length;
  
  const requiredQuestions = this.questions.filter(q => q.required).length;
  
  return Math.round((answeredQuestions / requiredQuestions) * 100);
});

HealthAssessmentSchema.virtual('isComplete').get(function() {
  return this.completionStatus === 'completed';
});

HealthAssessmentSchema.virtual('hasUrgentRecommendations').get(function() {
  if (!this.recommendations || this.recommendations.length === 0) return false;
  
  return this.recommendations.some(r => r.priority === 'urgent' && !r.completed);
});

// Indexes for efficient querying
HealthAssessmentSchema.index({ patient: 1, assessmentDate: -1 });
HealthAssessmentSchema.index({ patient: 1, assessmentType: 1 });
HealthAssessmentSchema.index({ completionStatus: 1 });
HealthAssessmentSchema.index({ 'results.riskLevel': 1 });
HealthAssessmentSchema.index({ 'flags.needsUrgentAttention': 1 });

module.exports = mongoose.model('HealthAssessment', HealthAssessmentSchema);
