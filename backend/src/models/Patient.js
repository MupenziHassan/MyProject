const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb'],
      default: 'kg'
    },
    updatedAt: Date
  },
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm'
    },
    updatedAt: Date
  },
  contactInfo: {
    primaryPhone: String,
    secondaryPhone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'unknown']
    },
    reactions: [String],
    diagnosed: Date
  }],
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'managed', 'unknown']
    },
    notes: String
  }],
  familyHistory: [{
    condition: String,
    relationship: String,
    notes: String
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
PatientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for BMI calculation if both height and weight are provided
PatientSchema.virtual('bmi').get(function() {
  if (!this.height?.value || !this.weight?.value) return null;
  
  let heightInMeters, weightInKg;
  
  // Convert height to meters if needed
  if (this.height.unit === 'cm') {
    heightInMeters = this.height.value / 100;
  } else if (this.height.unit === 'ft') {
    heightInMeters = this.height.value * 0.3048;
  }
  
  // Convert weight to kg if needed
  if (this.weight.unit === 'kg') {
    weightInKg = this.weight.value;
  } else if (this.weight.unit === 'lb') {
    weightInKg = this.weight.value * 0.453592;
  }
  
  // Calculate BMI: weight (kg) / (height (m))^2
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
});

// Virtual for retrieving patient's age
PatientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Add reverse virtual references
PatientSchema.virtual('medicalRecords', {
  ref: 'MedicalRecord',
  localField: 'user',
  foreignField: 'patient',
  justOne: false
});

PatientSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: 'user',
  foreignField: 'patient',
  justOne: false
});

PatientSchema.virtual('predictions', {
  ref: 'Prediction',
  localField: 'user',
  foreignField: 'patient',
  justOne: false
});

module.exports = mongoose.model('Patient', PatientSchema);
