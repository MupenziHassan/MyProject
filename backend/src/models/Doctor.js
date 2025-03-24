const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty']
  },
  subSpecialties: [String],
  licenseNumber: {
    type: String,
    required: [true, 'Please add a license number'],
    unique: true
  },
  licenseExpiryDate: Date,
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [{
    name: String,
    issuingAuthority: String,
    year: Number,
    expiryDate: Date
  }],
  workSchedule: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    }
  },
  appointmentDuration: {
    type: Number,
    default: 30, // in minutes
    min: [15, 'Appointment duration must be at least 15 minutes']
  },
  contactInfo: {
    officePhone: String,
    mobilePhone: String,
    email: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // For the verification process
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['license', 'certification', 'identification', 'other']
    },
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    notes: String
  }],
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  bio: String,
  profilePicture: String,
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
DoctorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual to check if license is expired
DoctorSchema.virtual('isLicenseExpired').get(function() {
  if (!this.licenseExpiryDate) return false;
  return new Date() > new Date(this.licenseExpiryDate);
});

// Virtual to get all patients seen by this doctor
DoctorSchema.virtual('patientsSeen', {
  ref: 'Appointment',
  localField: 'user',
  foreignField: 'doctor',
  justOne: false
});

// Virtual to get upcoming appointments
DoctorSchema.virtual('upcomingAppointments', {
  ref: 'Appointment',
  localField: 'user',
  foreignField: 'doctor',
  justOne: false,
  match: { 
    dateTime: { $gte: new Date() },
    status: { $nin: ['cancelled', 'no-show'] }
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
