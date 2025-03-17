const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  education: [{
    institution: String,
    degree: String,
    year: Number
  }],
  experience: {
    type: Number,
    default: 0
  },
  languages: [String],
  availability: {
    monday: {
      available: Boolean,
      slots: [String]
    },
    tuesday: {
      available: Boolean,
      slots: [String]
    },
    wednesday: {
      available: Boolean,
      slots: [String]
    },
    thursday: {
      available: Boolean,
      slots: [String]
    },
    friday: {
      available: Boolean,
      slots: [String]
    },
    saturday: {
      available: Boolean,
      slots: [String]
    },
    sunday: {
      available: Boolean,
      slots: [String]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
