const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brandName: {
    type: String,
    trim: true
  },
  // Medication classification
  classification: {
    type: String,
    enum: [
      'antibiotic', 'antiviral', 'antifungal', 'analgesic', 'anti_inflammatory',
      'antihypertensive', 'antidiabetic', 'antihistamine', 'bronchodilator',
      'corticosteroid', 'anticoagulant', 'antidepressant', 'antipsychotic',
      'immunosuppressant', 'hormone', 'vitamin', 'herbal', 'other'
    ]
  },
  // Medication identification codes
  codes: {
    ndc: String, // National Drug Code
    rxNorm: String, // RxNorm code
    atc: String, // Anatomical Therapeutic Chemical code
  },
  // Administration details
  dosage: {
    value: {
      type: mongoose.Schema.Types.Mixed, // Can be a number or a string like "1-2"
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: [
        'mg', 'g', 'mcg', 'mL', 'L', 'tsp', 'tbsp', 'oz', 'cup',
        'patch', 'drop', 'spray', 'tablet', 'capsule', 'pill', 'injection', 'unit', 'other'
      ]
    },
    route: {
      type: String,
      enum: [
        'oral', 'topical', 'injection', 'intravenous', 'intramuscular', 'subcutaneous',
        'sublingual', 'inhaled', 'rectal', 'nasal', 'ophthalmic', 'otic', 'other'
      ]
    },
    form: {
      type: String,
      enum: [
        'tablet', 'capsule', 'liquid', 'cream', 'ointment', 'gel', 'powder',
        'solution', 'suspension', 'spray', 'patch', 'suppository', 'drops', 'other'
      ]
    },
    instructions: String, // Special instructions like "Take with food"
  },
  // Frequency and timing
  frequency: {
    timesPerDay: Number,
    specificTimes: [String], // Array of times like ["08:00", "20:00"]
    intervalHours: Number, // Take every X hours
    schedule: {
      type: String,
      enum: [
        'daily', 'twice_daily', 'three_times_daily', 'four_times_daily',
        'once_weekly', 'twice_weekly', 'once_monthly', 'as_needed', 'other'
      ]
    },
    asNeeded: Boolean, // PRN indicator
    maxDailyDose: String,
    whenToTake: {
      type: String,
      enum: [
        'before_meals', 'with_meals', 'after_meals', 'before_sleep',
        'morning', 'afternoon', 'evening', 'any_time', 'other'
      ]
    }
  },
  // Prescription details
  prescription: {
    isActive: {
      type: Boolean,
      default: true
    },
    prescriptionDate: {
      type: Date
    },
    expirationDate: Date,
    refillsTotal: Number,
    refillsRemaining: Number,
    refillsUsed: Number,
    quantity: Number,
    daysSupply: Number,
    pharmacy: {
      name: String,
      phone: String,
      address: String
    },
    prescriptionNumber: String,
  },
  // Treatment period
  duration: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date, // null if ongoing/indefinite
    indefinite: {
      type: Boolean,
      default: false
    }
  },
  // Medication status
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued', 'on_hold', 'not_taken'],
    default: 'active'
  },
  // For discontinuation
  discontinuation: {
    date: Date,
    reason: String,
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Medical reasons for the medication
  reason: String,
  diagnosis: [{
    name: String,
    icd10Code: String
  }],
  // Insurance information
  insurance: {
    covered: Boolean,
    priorAuthorization: Boolean,
    authorizationNumber: String,
    copay: Number,
    notes: String
  },
  // Side effects and notes
  sideEffects: [String],
  warnings: [String],
  notes: String,
  // Adherence tracking
  adherence: {
    trackingEnabled: {
      type: Boolean,
      default: false
    },
    doses: [{
      scheduledTime: Date,
      takenTime: Date,
      takenStatus: {
        type: String,
        enum: ['taken', 'skipped', 'postponed', 'not_recorded'],
        default: 'not_recorded'
      },
      notes: String
    }]
  },
  // References to related medical records
  relatedRecords: [{
    recordType: {
      type: String,
      enum: ['MedicalRecord', 'Appointment', 'Test']
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  // Flags
  flags: {
    isHighRisk: Boolean,
    isControlledSubstance: Boolean,
    isInvestigational: Boolean,
    scheduleClass: String, // For controlled substances (Schedule I-V)
    requiresMonitoring: Boolean
  },
  // Alerts
  alerts: [{
    type: {
      type: String,
      enum: ['allergy', 'interaction', 'duplicate_therapy', 'contraindication', 'other']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    message: String,
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date
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
MedicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update refillsUsed when refillsRemaining changes
MedicationSchema.pre('save', function(next) {
  if (this.isModified('prescription.refillsRemaining') && 
      this.prescription.refillsTotal !== undefined) {
    this.prescription.refillsUsed = 
      this.prescription.refillsTotal - this.prescription.refillsRemaining;
  }
  next();
});

// Virtuals
MedicationSchema.virtual('isExpired').get(function() {
  if (!this.prescription.expirationDate) return false;
  return new Date() > new Date(this.prescription.expirationDate);
});

MedicationSchema.virtual('adherenceRate').get(function() {
  if (!this.adherence.trackingEnabled || !this.adherence.doses.length) return null;
  
  const totalDoses = this.adherence.doses.length;
  const takenDoses = this.adherence.doses.filter(dose => dose.takenStatus === 'taken').length;
  
  return (takenDoses / totalDoses) * 100;
});

MedicationSchema.virtual('refillDue').get(function() {
  if (!this.prescription.daysSupply || !this.duration.startDate) return false;
  
  const startDate = new Date(this.duration.startDate);
  const daysSupply = this.prescription.daysSupply;
  const today = new Date();
  
  // Calculate refill date (start date + days supply)
  const refillDate = new Date(startDate);
  refillDate.setDate(refillDate.getDate() + daysSupply);
  
  // Consider refill due when within 5 days of running out
  const refillDueDate = new Date(refillDate);
  refillDueDate.setDate(refillDueDate.getDate() - 5);
  
  return today >= refillDueDate;
});

MedicationSchema.virtual('daysRemaining').get(function() {
  if (!this.prescription.daysSupply || !this.duration.startDate) return null;
  
  const startDate = new Date(this.duration.startDate);
  const daysSupply = this.prescription.daysSupply;
  const today = new Date();
  
  // Calculate end date of current supply
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysSupply);
  
  // Calculate days remaining
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Indexes for efficient querying
MedicationSchema.index({ patient: 1, status: 1 });
MedicationSchema.index({ patient: 1, 'duration.startDate': -1 });
MedicationSchema.index({ 'prescription.expirationDate': 1 });
MedicationSchema.index({ 'prescription.isActive': 1 });
MedicationSchema.index({ name: 'text', genericName: 'text', brandName: 'text' });

module.exports = mongoose.model('Medication', MedicationSchema);
