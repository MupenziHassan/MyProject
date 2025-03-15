const mongoose = require('mongoose');

const PatientBiomarkersSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collectionDate: {
    type: Date,
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  },
  provider: {
    name: String,
    facility: String,
    role: String
  },
  bloodMarkers: {
    completeBloodCount: {
      wbc: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      rbc: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      hemoglobin: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      hematocrit: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      platelets: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      neutrophils: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      lymphocytes: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      monocytes: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      eosinophils: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      basophils: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean }
    },
    metabolicPanel: {
      glucose: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      bun: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      creatinine: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      sodium: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      potassium: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      calcium: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      protein: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      albumin: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      bilirubin: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      alkalinePhosphatase: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      alt: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      ast: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean }
    },
    lipidPanel: {
      totalCholesterol: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      ldl: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      hdl: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      triglycerides: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean }
    }
  },
  tumorMarkers: {
    cea: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    afp: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    ca125: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    ca153: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    ca199: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    psa: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    hcg: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    calcitonin: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean }
  },
  geneticMarkers: [{
    name: String,
    result: String,
    interpretation: String,
    isAbnormal: Boolean
  }],
  immuneMarkers: {
    wbcSubsets: {
      neutrophilPercent: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      lymphocytePercent: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      nkCellCount: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      tCellCount: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      bCellCount: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean }
    },
    inflammatoryMarkers: {
      crp: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      esr: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      il6: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
      tnfAlpha: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean }
    }
  },
  hormoneMarkers: {
    estrogen: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    progesterone: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    testosterone: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    tsh: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    t3: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean },
    t4: { value: Number, unit: String, normalRange: String, isAbnormal: Boolean }
  },
  otherBiomarkers: [{
    name: String,
    value: Number,
    unit: String,
    normalRange: String,
    isAbnormal: Boolean,
    notes: String
  }],
  interpretations: [{
    marker: String,
    interpretation: String,
    clinicalSignificance: String,
    recommendedAction: String
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PatientBiomarkers', PatientBiomarkersSchema);
