const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
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
  dateTime: {
    type: Date,
    required: [true, 'Please specify the appointment date and time']
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30, // in minutes
    min: [15, 'Appointment duration must be at least 15 minutes']
  },
  type: {
    type: String,
    enum: ['initial_consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist_consultation', 'telemedicine', 'other'],
    default: 'initial_consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the appointment']
  },
  symptoms: [String],
  notes: {
    patient: String, // Notes provided by the patient
    doctor: String   // Notes provided by the doctor
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  location: {
    type: {
      type: String,
      enum: ['in-person', 'video', 'phone'],
      default: 'in-person'
    },
    address: {
      facilityName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      roomNumber: String
    },
    videoLink: String,
    phoneNumber: String
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in-app'],
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['scheduled', 'sent', 'failed'],
      default: 'scheduled'
    }
  }],
  // What happened after the appointment
  outcome: {
    completed: {
      type: Boolean,
      default: false
    },
    summary: String,
    followUpNeeded: Boolean,
    followUpTimeline: String,
    prescriptionsIssued: Boolean,
    referralsIssued: Boolean,
    labTestsOrdered: Boolean
  },
  // For telemedicine/virtual appointments
  virtualAppointment: {
    platform: String, // e.g., Zoom, Teams, etc.
    meetingId: String,
    password: String,
    joinUrl: String,
    hostUrl: String
  },
  // Reference to a related medical record (if created)
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  insurance: {
    provider: String,
    policyNumber: String,
    verified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    coverageDetails: String
  },
  billing: {
    status: {
      type: String,
      enum: ['pending', 'billed', 'paid', 'partially_paid', 'insurance_pending', 'waived'],
      default: 'pending'
    },
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    paymentDate: Date,
    paymentMethod: String,
    invoiceNumber: String,
    notes: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Middleware to update the updatedAt field
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate endTime based on dateTime and duration
AppointmentSchema.pre('save', function(next) {
  if (this.isModified('dateTime') || this.isModified('duration')) {
    const startDateTime = new Date(this.dateTime);
    this.endTime = new Date(startDateTime.getTime() + this.duration * 60000);
  }
  next();
});

// Virtuals
AppointmentSchema.virtual('isPast').get(function() {
  return new Date() > new Date(this.dateTime);
});

AppointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.dateTime);
  return (
    today.getDate() === appointmentDate.getDate() &&
    today.getMonth() === appointmentDate.getMonth() &&
    today.getFullYear() === appointmentDate.getFullYear()
  );
});

AppointmentSchema.virtual('daysUntil').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(this.dateTime);
  appointmentDate.setHours(0, 0, 0, 0);
  const diffTime = appointmentDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes for common queries
AppointmentSchema.index({ patient: 1, dateTime: 1 });
AppointmentSchema.index({ doctor: 1, dateTime: 1 });
AppointmentSchema.index({ status: 1, dateTime: 1 });
AppointmentSchema.index({ dateTime: 1 }); // For calendar views and date range queries

module.exports = mongoose.model('Appointment', AppointmentSchema);
