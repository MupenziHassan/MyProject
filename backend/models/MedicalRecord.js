const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recordType: {
    type: String,
    enum: ['visit', 'lab', 'procedure', 'vaccination', 'medication', 'allergy', 'diagnosis', 'imaging', 'other'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  notes: String,
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  status: {
    type: String,
    enum: ['active', 'archived', 'pending', 'deleted'],
    default: 'active'
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt field on save
MedicalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for common queries
MedicalRecordSchema.index({ patient: 1, date: -1 });
MedicalRecordSchema.index({ doctor: 1, date: -1 });
MedicalRecordSchema.index({ recordType: 1 });
MedicalRecordSchema.index({ isFlagged: 1 });

module.exports = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
