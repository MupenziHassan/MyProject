const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  summary: {
    type: String
  },
  components: [{
    name: {
      type: String,
      required: true
    },
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
  }],
  // Information about who performed the test
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
  status: {
    type: String,
    enum: ['pending', 'preliminary', 'final', 'amended', 'cancelled', 'corrected'],
    default: 'pending'
  },
  isAbnormal: {
    type: Boolean,
    default: false
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  viewedByPatient: {
    type: Boolean, 
    default: false
  },
  viewedByDoctor: {
    type: Boolean,
    default: false
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

// Update the updatedAt field on save
TestResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate if results are abnormal automatically
  if (this.components && this.components.length > 0) {
    this.isAbnormal = this.components.some(component => 
      component.interpretation && 
      ['abnormal', 'critical_high', 'critical_low', 'high', 'low'].includes(component.interpretation)
    );
  }
  
  next();
});

// Virtual to get test name
TestResultSchema.virtual('testName').get(function() {
  return this.test ? this.test.name : 'Unknown Test';
});

// Index for common queries
TestResultSchema.index({ patient: 1, reportDate: -1 });
TestResultSchema.index({ doctor: 1, reportDate: -1 });
TestResultSchema.index({ test: 1 });
TestResultSchema.index({ isAbnormal: 1 });
TestResultSchema.index({ status: 1 });

module.exports = mongoose.models.TestResult || mongoose.model('TestResult', TestResultSchema);
