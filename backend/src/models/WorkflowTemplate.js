const mongoose = require('mongoose');

const workflowStageTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  order: {
    type: Number,
    required: true
  },
  expectedDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'days'
    }
  },
  requiredActions: [{
    name: String,
    description: String,
    requiredRole: {
      type: String,
      enum: ['patient', 'doctor', 'nurse', 'specialist', 'any'],
      default: 'any'
    }
  }],
  resources: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'website', 'video', 'form', 'other'],
      default: 'document'
    }
  }]
});

const WorkflowTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: String,
  type: {
    type: String,
    enum: ['screening', 'diagnosis', 'treatment', 'follow_up', 'other'],
    required: true
  },
  subType: {
    type: String,
    enum: [
      'breast_cancer_screening',
      'lung_cancer_screening',
      'colorectal_cancer_screening',
      'skin_cancer_screening',
      'prostate_cancer_screening',
      'breast_cancer_treatment',
      'lung_cancer_treatment',
      'general_oncology',
      'surgical_oncology',
      'radiation_oncology',
      'other'
    ],
    default: 'other'
  },
  stages: [workflowStageTemplateSchema],
  totalStages: {
    type: Number,
    default: function() {
      return this.stages.length;
    }
  },
  estimatedDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'weeks'
    }
  },
  recommendedFor: {
    patientCharacteristics: {
      minAge: Number,
      maxAge: Number,
      gender: {
        type: String,
        enum: ['male', 'female', 'any'],
        default: 'any'
      },
      riskFactors: [String]
    },
    cancerTypes: [String]
  },
  version: {
    type: String,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'deprecated'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  timestamps: true
});

module.exports = mongoose.model('WorkflowTemplate', WorkflowTemplateSchema);
