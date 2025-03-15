const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  ethnicity: {
    type: String,
    enum: ['caucasian', 'african', 'asian', 'hispanic', 'middleEastern', 'pacificIslander', 'other']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  physicalMeasurements: {
    height: Number, // in cm
    weight: Number, // in kg
    bmi: Number,
    waistCircumference: Number, // in cm
  },
  contactInfo: {
    primaryPhone: String,
    alternatePhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    medications: [String],
    treatments: [String],
    notes: String,
    status: {
      type: String,
      enum: ['active', 'resolved', 'managed', 'unknown'],
      default: 'active'
    }
  }],
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    diagnosed: Date
  }],
  familyHistory: [{
    condition: String,
    relationship: String,
    ageAtDiagnosis: Number,
    notes: String
  }],
  lifestyle: {
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current', 'passive']
    },
    smokingFrequency: String,
    smokingHistory: Number, // pack years
    alcoholConsumption: {
      type: String,
      enum: ['none', 'occasional', 'moderate', 'heavy']
    },
    alcoholFrequency: String, // drinks per week
    exerciseFrequency: {
      type: String,
      enum: ['none', 'light', 'moderate', 'active']
    },
    exerciseMinutesPerWeek: Number,
    dietType: {
      type: String,
      enum: ['regular', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other']
    },
    occupation: String,
    occupationalExposures: [String] // e.g., asbestos, radiation, chemicals
  },
  cancerRiskFactors: {
    previousCancerDiagnosis: Boolean,
    previousCancerDetails: [{
      cancerType: String,
      diagnosedDate: Date,
      treatments: [String],
      inRemission: Boolean
    }],
    geneticRiskFactors: [{
      gene: String, // e.g., BRCA1, BRCA2
      mutation: String,
      testedDate: Date
    }],
    environmentalExposures: [{
      agent: String,
      duration: String,
      exposureLevel: String
    }]
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

module.exports = mongoose.model('Patient', PatientSchema);
