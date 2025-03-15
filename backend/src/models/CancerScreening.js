const mongoose = require('mongoose');

const CancerScreeningSchema = new mongoose.Schema({
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
  screeningType: {
    type: String,
    required: true,
    enum: [
      'mammogram', 'colonoscopy', 'pap_smear', 'psa_test',
      'skin_examination', 'lung_ct_scan', 'breast_mri',
      'breast_ultrasound', 'hpv_test', 'ca125_test', 'other'
    ]
  },
  cancerType: {
    type: String,
    enum: [
      'breast', 'colorectal', 'cervical', 'prostate', 
      'skin', 'lung', 'ovarian', 'other'
    ]
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: Date,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'missed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  result: {
    type: String,
    enum: ['normal', 'abnormal', 'inconclusive', 'pending', null],
    default: null
  },
  resultDetails: {
    description: String,
    biRadScore: String,  // For mammograms
    findings: String,
    recommendations: String,
    followUpNeeded: Boolean,
    followUpTimeframe: String
  },
  facility: {
    name: String,
    location: String,
    provider: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  patientNotified: {
    type: Boolean,
    default: false
  },
  relatedTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
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
  timestamps: true
});

module.exports = mongoose.model('CancerScreening', CancerScreeningSchema);
