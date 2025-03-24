const mongoose = require('mongoose');

const CancerScreeningResultSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  screening: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CancerScreening'
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  },
  cancerType: {
    type: String,
    required: true,
    enum: ['breast', 'lung', 'colorectal', 'prostate', 'skin', 'cervical', 'ovarian', 'pancreatic', 'other']
  },
  screeningMethod: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  result: {
    type: String,
    enum: ['normal', 'abnormal', 'suspicious', 'positive', 'negative', 'inconclusive'],
    required: true
  },
  biRadScore: String, // For mammograms
  findings: String,
  recommendations: String,
  followUpNeeded: {
    type: Boolean,
    default: false
  },
  followUpTimeframe: String,
  images: [{
    description: String,
    imageUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  performedBy: {
    name: String,
    facility: String,
    credentials: String
  },
  interpretedBy: {
    name: String,
    specialty: String,
    date: Date
  },
  patientNotified: {
    type: Boolean,
    default: false
  },
  notificationDate: Date,
  notes: String,
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

// Pre-save hook to update timestamps
CancerScreeningResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual to determine urgency level
CancerScreeningResultSchema.virtual('urgencyLevel').get(function() {
  if (this.result === 'positive' || this.result === 'suspicious') {
    return 'high';
  } else if (this.result === 'abnormal') {
    return 'medium';
  }
  return 'low';
});

// Indexes for common queries
CancerScreeningResultSchema.index({ patient: 1, date: -1 });
CancerScreeningResultSchema.index({ doctor: 1, date: -1 });
CancerScreeningResultSchema.index({ result: 1 });
CancerScreeningResultSchema.index({ cancerType: 1 });
CancerScreeningResultSchema.index({ followUpNeeded: 1 });

module.exports = mongoose.model('CancerScreeningResult', CancerScreeningResultSchema);
