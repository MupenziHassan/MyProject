const mongoose = require('mongoose');

const TreatmentPlanSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Treatment plan title is required'],
    trim: true
  },
  description: String,
  // Associated diagnoses
  diagnoses: [{
    name: String,
    icd10Code: String,
    description: String,
    diagnosisDate: Date,
    diagnosedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Treatment type and category
  treatmentType: {
    type: String,
    enum: [
      'preventive', 'curative', 'palliative', 'supportive', 
      'rehabilitation', 'chronic_management', 'other'
    ],
    required: true
  },
  category: {
    type: String,
    enum: [
      'oncology', 'cardiology', 'neurology', 'gastroenterology',
      'endocrinology', 'orthopedics', 'psychiatry', 'primary_care',
      'pulmonology', 'nephrology', 'other'
    ]
  },
  // Timeline of treatment
  timeline: {
    startDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    endDate: Date,
    duration: String, // e.g., "6 months", "ongoing"
    phase: {
      type: String,
      enum: ['initial', 'acute', 'maintenance', 'follow_up', 'completed'],
      default: 'initial'
    }
  },
  // Treatment components
  treatments: [{
    type: {
      type: String,
      enum: [
        'medication', 'procedure', 'surgery', 'therapy', 
        'lifestyle_modification', 'monitoring', 'other'
      ]
    },
    name: String,
    description: String,
    instructions: String,
    frequency: String,
    duration: String,
    provider: String,
    facility: String,
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'discontinued', 'on_hold'],
      default: 'scheduled'
    },
    notes: String
  }],
  // Goals of treatment
  goals: [{
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'achieved', 'modified', 'abandoned'],
      default: 'pending'
    },
    notes: String
  }],
  // Follow-up appointments
  followUps: [{
    description: String,
    scheduledDate: Date,
    type: {
      type: String,
      enum: ['office_visit', 'test', 'imaging', 'procedure', 'other']
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'missed', 'rescheduled'],
      default: 'scheduled'
    },
    notes: String
  }],
  // Side effect management
  sideEffectManagement: [{
    symptom: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life_threatening'],
      default: 'mild'
    },
    management: String,
    medications: [String],
    reportDate: Date,
    resolvedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolving', 'resolved', 'chronic'],
      default: 'active'
    }
  }],
  // Nutritional guidelines
  nutritionalGuidelines: {
    recommendations: String,
    restrictions: [String],
    supplements: [String],
    hydrationGoal: String
  },
  // Psychological support
  psychologicalSupport: {
    recommended: Boolean,
    type: [String], // e.g., ["individual therapy", "support group"]
    provider: String,
    notes: String
  },
  // Overall treatment plan status
  status: {
    type: String,
    enum: ['active', 'completed', 'modified', 'discontinued'],
    default: 'active'
  },
  // Clinical notes
  notes: String,
  // Supporting documents
  documents: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Patient education materials
  educationMaterials: [{
    title: String,
    description: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'pdf', 'website', 'other']
    },
    providedDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Related medical records
  relatedRecords: [{
    recordType: {
      type: String,
      enum: ['MedicalRecord', 'Appointment', 'Test', 'Prediction']
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  // Patient agreement and understanding
  patientAgreement: {
    discussedWithPatient: {
      type: Boolean,
      default: false
    },
    discussionDate: Date,
    patientQuestionsAddressed: Boolean,
    patientUnderstands: Boolean,
    patientConsents: Boolean,
    consentDocumentUrl: String
  },
  // Treatment plan history for tracking changes
  revisionHistory: [{
    revisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    revisionDate: {
      type: Date,
      default: Date.now
    },
    revisionReason: String,
    changesDescription: String,
    previousVersion: mongoose.Schema.Types.Mixed
  }],
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
TreatmentPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtuals
TreatmentPlanSchema.virtual('progress').get(function() {
  if (!this.goals || this.goals.length === 0) return 0;
  
  const achievedGoals = this.goals.filter(goal => goal.status === 'achieved').length;
  return Math.round((achievedGoals / this.goals.length) * 100);
});

TreatmentPlanSchema.virtual('durationInDays').get(function() {
  if (!this.timeline.startDate) return null;
  
  const endDate = this.timeline.endDate || new Date();
  const startDate = new Date(this.timeline.startDate);
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

TreatmentPlanSchema.virtual('isComplete').get(function() {
  return this.status === 'completed';
});

// Indexes for efficient querying
TreatmentPlanSchema.index({ patient: 1, status: 1 });
TreatmentPlanSchema.index({ doctor: 1, status: 1 });
TreatmentPlanSchema.index({ 'timeline.startDate': -1 });
TreatmentPlanSchema.index({ 'diagnoses.icd10Code': 1 });

module.exports = mongoose.model('TreatmentPlan', TreatmentPlanSchema);
