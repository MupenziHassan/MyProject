const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'blood', 'urine', 'imaging', 'pathology', 
      'genetic', 'microbiological', 'neurological', 
      'cardiac', 'pulmonary', 'other'
    ],
    required: true
  },
  subCategory: String,
  testCode: String, // For standardized test codes (CPT, LOINC, etc.)
  description: String,
  instructions: {
    patient: String, // Instructions for the patient
    collector: String // Instructions for the specimen collector
  },
  status: {
    type: String,
    enum: ['ordered', 'scheduled', 'specimen_collected', 'in_lab', 'completed', 'cancelled', 'rejected'],
    default: 'ordered'
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  fasting: {
    required: {
      type: Boolean,
      default: false
    },
    duration: Number, // Hours of fasting
    instructions: String
  },
  // Details about specimen collection
  specimenCollection: {
    type: {
      type: String,
      enum: ['blood', 'urine', 'stool', 'saliva', 'tissue', 'swab', 'other']
    },
    collectedAt: Date,
    collectedBy: {
      name: String,
      role: String,
      facilityName: String
    },
    siteNotes: String,
    specimenId: String,
    quantity: String,
    container: String,
    handlingNotes: String
  },
  // For imaging tests
  imaging: {
    modality: {
      type: String,
      enum: ['x-ray', 'ct', 'mri', 'ultrasound', 'mammogram', 'pet', 'dexa', 'other']
    },
    bodyPart: String,
    contrast: {
      required: Boolean,
      type: String
    },
    views: [String]
  },
  // Test dates
  dates: {
    ordered: {
      type: Date,
      default: Date.now
    },
    scheduled: Date,
    collected: Date,
    receivedInLab: Date,
    completed: Date,
    reportedAt: Date
  },
  // Test results
  results: {
    summary: String,
    components: [{
      name: String,
      value: mongoose.Schema.Types.Mixed,
      unit: String,
      referenceRange: String,
      interpretation: {
        type: String,
        enum: ['normal', 'abnormal', 'critical_high', 'critical_low', 'high', 'low', 'non_conclusive']
      },
      flag: {
        type: String,
        enum: ['H', 'L', 'A', 'C', 'N', '*', null]
      },
      notes: String
    }],
    narrative: String,
    conclusion: String,
    recommendations: String,
    attachments: [{
      title: String,
      fileUrl: String,
      fileType: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // For lab tests
  performedBy: {
    lab: String,
    technician: String,
    address: String,
    phone: String,
    licenseNumber: String
  },
  // For radiology tests
  interpretedBy: {
    name: String,
    specialty: String,
    interpretationDate: Date,
    licenseNumber: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    authorizationNumber: String,
    isPreAuthorized: Boolean,
    estimatedCost: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  // Notification/delivery info
  notifications: [{
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['ordered', 'results_ready', 'abnormal_results', 'reminder', 'cancelled']
    },
    sentAt: Date,
    channel: {
      type: String,
      enum: ['email', 'sms', 'push', 'in-app']
    },
    status: {
      type: String,
      enum: ['scheduled', 'sent', 'delivered', 'read', 'failed']
    }
  }],
  // Medical record reference
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  // Tracking for follow-up assessments based on results
  followUp: {
    required: Boolean,
    timeframe: String,
    type: {
      type: String,
      enum: ['appointment', 'repeat_test', 'referral', 'medication_change', 'other']
    },
    notes: String,
    completedAt: Date
  },
  // Notes and comments
  notes: {
    type: String
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
TestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update date fields based on status changes
TestSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'scheduled':
        if (!this.dates.scheduled) this.dates.scheduled = now;
        break;
      case 'specimen_collected':
        if (!this.dates.collected) this.dates.collected = now;
        break;
      case 'in_lab':
        if (!this.dates.receivedInLab) this.dates.receivedInLab = now;
        break;
      case 'completed':
        if (!this.dates.completed) this.dates.completed = now;
        
        // If results are added during completion, set reported date
        if (this.results && !this.dates.reportedAt) {
          this.dates.reportedAt = now;
        }
        break;
    }
  }
  
  // If adding results, update reportedAt time
  if (this.isModified('results') && !this.dates.reportedAt) {
    this.dates.reportedAt = now;
  }
  
  next();
});

// Virtuals
TestSchema.virtual('isAbnormal').get(function() {
  if (!this.results || !this.results.components || this.results.components.length === 0) {
    return false;
  }
  
  return this.results.components.some(component => 
    component.interpretation && 
    ['abnormal', 'critical_high', 'critical_low', 'high', 'low'].includes(component.interpretation)
  );
});

TestSchema.virtual('turnaroundTime').get(function() {
  if (!this.dates.ordered || !this.dates.completed) return null;
  
  const ordered = new Date(this.dates.ordered);
  const completed = new Date(this.dates.completed);
  const diffTime = Math.abs(completed - ordered);
  const diffHours = Math.round(diffTime / (1000 * 60 * 60));
  
  return diffHours;
});

TestSchema.virtual('isPending').get(function() {
  return !['completed', 'cancelled', 'rejected'].includes(this.status);
});

// Indexes for common queries
TestSchema.index({ patient: 1, 'dates.ordered': -1 });
TestSchema.index({ doctor: 1, 'dates.ordered': -1 });
TestSchema.index({ status: 1 });
TestSchema.index({ category: 1, status: 1 });
TestSchema.index({ 'dates.ordered': -1 });

module.exports = mongoose.model('Test', TestSchema);
