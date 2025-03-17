const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String, 
    enum: ['general', 'symptoms', 'cancerRisk'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // General health metrics
  height: Number,
  weight: Number,
  bloodPressureSystolic: Number,
  bloodPressureDiastolic: Number,
  heartRate: Number,
  bodyTemperature: Number,
  oxygenSaturation: Number,
  bloodSugar: Number,
  
  // Symptoms fields
  primarySymptom: String,
  secondarySymptoms: String,
  painLevel: String,
  symptomDuration: String,
  symptomFrequency: String,
  triggeredBy: String,
  relievedBy: String,
  
  // Cancer risk fields
  previousCancerDiagnosis: String,
  cancerType: String,
  diagnosisDate: String,
  familyCancerHistory: String,
  familyCancerTypes: String,
  smokingStatus: String,
  yearsSmoked: String,
  alcoholConsumption: String,
  sunExposure: String,
  radiationExposure: String,
  geneticTesting: String,
  geneticRiskFactors: String,
  
  notes: String
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
