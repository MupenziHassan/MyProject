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
  diagnosis: {
    condition: String,
    diagnosisDate: Date,
    cancerType: String,
    stage: String,
    grade: String,
    details: String
  },
  basedOnPrediction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  },
  treatments: [{
    type: {
      type: String,
      enum: ['surgery', 'chemotherapy', 'radiation', 'immunotherapy', 'hormone_therapy', 'targeted_therapy', 'medication', 'alternative', 'other'],
      required: true
    },
    name: String,
    description: String,
    dosage: String,
    frequency: String,
    duration: String,
    startDate: Date,
    endDate: Date,
    provider: String,
    facility: String,
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'discontinued', 'on_hold'],
      default: 'scheduled'
    },
    notes: String
  }],
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
  nutritionalGuidelines: {
    recommendations: String,
    restrictions: [String],
    supplements: [String],
    hydrationGoal: String
  },
  psychologicalSupport: {
    recommended: Boolean,
    type: [String], // e.g., ["individual therapy", "support group"]
    provider: String,
    notes: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'modified', 'discontinued'],
    default: 'active'
  },
  notes: String,
  documents: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
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
  timestamps: true
});

module.exports = mongoose.model('TreatmentPlan', TreatmentPlanSchema);
