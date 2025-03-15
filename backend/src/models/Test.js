const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required']
  },
  description: {
    type: String
  },
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
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['blood', 'imaging', 'pathology', 'genetic', 'other'],
    default: 'other'
  },
  testType: {
    type: String,
    enum: [
      'cbc', 'chemistry', 'tumor_markers', 'xray', 'ct_scan', 'mri', 
      'ultrasound', 'biopsy', 'genetic_panel', 'other'
    ],
    default: 'other'
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // For common cancer-related blood tests
  bloodResults: {
    wbc: { value: Number, unit: String, normalRange: String },
    rbc: { value: Number, unit: String, normalRange: String },
    hemoglobin: { value: Number, unit: String, normalRange: String },
    hematocrit: { value: Number, unit: String, normalRange: String },
    platelets: { value: Number, unit: String, normalRange: String },
    neutrophils: { value: Number, unit: String, normalRange: String },
    lymphocytes: { value: Number, unit: String, normalRange: String }
  },
  // For tumor markers
  tumorMarkers: {
    cea: { value: Number, unit: String, normalRange: String },
    afp: { value: Number, unit: String, normalRange: String },
    ca125: { value: Number, unit: String, normalRange: String },
    ca153: { value: Number, unit: String, normalRange: String },
    ca199: { value: Number, unit: String, normalRange: String },
    psa: { value: Number, unit: String, normalRange: String }
  },
  // For imaging tests
  imagingResults: {
    findingDescription: String,
    impressions: String,
    abnormalFindings: Boolean,
    imageUrls: [String],
    radiologistNotes: String
  },
  // For biopsy results
  biopsyResults: {
    tissueSite: String,
    sampleCollectionMethod: String,
    tissueDiagnosis: String,
    malignant: Boolean,
    cancerType: String,
    grade: String,
    stage: String,
    pathologistNotes: String
  },
  // For genetic tests
  geneticResults: {
    genes: [{
      name: String,
      mutation: String,
      pathogenic: Boolean,
      interpretation: String
    }],
    geneticistNotes: String
  },
  status: {
    type: String,
    enum: ['ordered', 'collected', 'processing', 'completed', 'cancelled'],
    default: 'ordered'
  },
  notes: {
    type: String
  },
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAbnormal: {
    type: Boolean,
    default: false
  },
  performedBy: {
    name: String,
    role: String,
    facility: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', TestSchema);
