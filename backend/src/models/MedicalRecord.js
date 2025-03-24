const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
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
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  recordType: {
    type: String,
    enum: ['general_checkup', 'specialist_visit', 'emergency', 'follow_up', 'lab_result', 'imaging', 'telemedicine', 'other'],
    required: true
  },
  vitalSigns: {
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: {
        type: String,
        default: 'mmHg'
      }
    },
    heartRate: {
      value: Number,
      unit: {
        type: String,
        default: 'bpm'
      }
    },
    respiratoryRate: {
      value: Number,
      unit: {
        type: String,
        default: 'bpm'
      }
    },
    oxygenSaturation: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb'],
        default: 'kg'
      }
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm'
      }
    },
    bmi: Number
  },
  chiefComplaint: String,
  // History of Present Illness
  hpi: {
    onset: String,
    duration: String,
    severity: String,
    location: String,
    characterization: String,
    aggravatingFactors: [String],
    relievingFactors: [String],
    associatedSymptoms: [String]
  },
  diagnosis: [{
    name: String,
    icd10Code: String,
    type: {
      type: String,
      enum: ['primary', 'secondary', 'differential', 'working', 'final'],
      default: 'working'
    },
    notes: String
  }],
  treatment: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String,
      startDate: Date,
      endDate: Date
    }],
    procedures: [{
      name: String,
      date: Date,
      notes: String,
      outcome: String
    }],
    therapies: [{
      type: String,
      frequency: String,
      duration: String,
      provider: String,
      notes: String
    }]
  },
  labTests: [{
    name: String,
    date: Date,
    results: mongoose.Schema.Types.Mixed,
    referenceRange: String,
    interpretation: String,
    isAbnormal: Boolean
  }],
  imaging: [{
    type: {
      type: String,
      enum: ['x-ray', 'ct_scan', 'mri', 'ultrasound', 'pet_scan', 'other']
    },
    bodyPart: String,
    date: Date,
    findings: String,
    impressions: String,
    imageUrl: String
  }],
  // Assessment and Plan
  assessment: String,
  plan: String,
  // Instructions for the patient
  patientInstructions: String,
  // Follow-up appointment details
  followUp: {
    recommended: Boolean,
    timeframe: String,
    instructions: String,
    scheduledDate: Date
  },
  // Any attached documents
  attachments: [{
    title: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Record visibility/access
  privacySettings: {
    restrictedAccess: {
      type: Boolean,
      default: false
    },
    authorizedUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String
    }]
  },
  // Audit trail of record changes
  recordHistory: [{
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }]
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

// Middleware to update the updatedAt field
MedicalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate BMI if height and weight are present
MedicalRecordSchema.pre('save', function(next) {
  if (this.vitalSigns?.height?.value && this.vitalSigns?.weight?.value) {
    let heightInMeters, weightInKg;
    
    // Convert height to meters if needed
    if (this.vitalSigns.height.unit === 'cm') {
      heightInMeters = this.vitalSigns.height.value / 100;
    } else if (this.vitalSigns.height.unit === 'ft') {
      heightInMeters = this.vitalSigns.height.value * 0.3048;
    }
    
    // Convert weight to kg if needed
    if (this.vitalSigns.weight.unit === 'kg') {
      weightInKg = this.vitalSigns.weight.value;
    } else if (this.vitalSigns.weight.unit === 'lb') {
      weightInKg = this.vitalSigns.weight.value * 0.453592;
    }
    
    // Calculate BMI: weight (kg) / (height (m))^2
    this.vitalSigns.bmi = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

// Ensure proper indexing for efficient queries
MedicalRecordSchema.index({ patient: 1, visitDate: -1 });
MedicalRecordSchema.index({ doctor: 1, visitDate: -1 });
MedicalRecordSchema.index({ 'diagnosis.icd10Code': 1 });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
