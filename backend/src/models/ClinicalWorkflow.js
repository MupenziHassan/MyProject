const mongoose = require('mongoose');

// Define schema for workflow stages
const workflowStageSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped', 'cancelled'],
    default: 'pending'
  },
  requiredActions: [{
    name: String,
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date
  }],
  notes: String,
  startDate: Date,
  completionDate: Date
});

const ClinicalWorkflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  primaryDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  healthcareTeam: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String
  }],
  stages: [workflowStageSchema],
  currentStage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  consentStatus: {
    patientConsent: {
      status: {
        type: Boolean,
        default: false
      },
      date: Date
    }
  },
  relatedRecords: {
    predictions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prediction'
    }],
    tests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    }],
    treatments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentPlan'
    }]
  },
  templates: {
    followedTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkflowTemplate'
    },
    deviations: [{
      stage: Number,
      description: String,
      reason: String
    }]
  },
  timeline: [{
    event: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

// Add pre-save hook to update the timeline on stage changes
ClinicalWorkflowSchema.pre('save', function(next) {
  const workflow = this;
  
  // If the workflow is being created, add creation event to timeline
  if (workflow.isNew) {
    workflow.timeline.push({
      event: 'Workflow Created',
      description: `${workflow.name} workflow initiated`,
      date: new Date(),
      user: workflow.primaryDoctor
    });
  } else if (workflow.isModified('currentStage')) {
    // If stage has changed, add to timeline
    const newStage = workflow.stages[workflow.currentStage];
    if (newStage) {
      workflow.timeline.push({
        event: 'Stage Changed',
        description: `Workflow advanced to stage: ${newStage.name}`,
        date: new Date(),
        user: workflow._modifiedBy // Set by the controller
      });
    }
  }
  
  next();
});

module.exports = mongoose.model('ClinicalWorkflow', ClinicalWorkflowSchema);
