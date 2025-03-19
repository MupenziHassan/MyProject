const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  bloodPressure: {
    type: String
  },
  bloodSugar: {
    type: String
  },
  smokingStatus: {
    type: String,
    enum: ['never', 'former', 'current'],
    default: 'never'
  },
  alcoholConsumption: {
    type: String,
    enum: ['none', 'light', 'moderate', 'heavy'],
    default: 'none'
  },
  familyHistory: {
    cancer: { type: Boolean, default: false },
    diabetes: { type: Boolean, default: false },
    heartDisease: { type: Boolean, default: false },
    hypertension: { type: Boolean, default: false }
  },
  symptoms: {
    type: String
  },
  testResults: {
    type: String
  },
  doctorNotes: {
    type: String
  },
  recommendations: {
    type: String
  },
  riskAssessment: {
    bmi: { type: Number },
    bmiCategory: { type: String },
    riskFactorCount: { type: Number },
    cancerRiskLevel: { 
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      default: 'Low'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'completed'],
    default: 'completed'
  }
}, { timestamps: true });

const Assessment = mongoose.model('Assessment', AssessmentSchema);

module.exports = Assessment;
