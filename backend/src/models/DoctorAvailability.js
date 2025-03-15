const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  }
});

const DoctorAvailabilitySchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dayOfWeek: {
    type: Number, // 0=Sunday, 1=Monday, etc.
    required: true
  },
  availableSlots: [TimeSlotSchema],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', null],
    default: null
  },
  exceptions: [{
    date: Date,
    reason: String
  }],
  workingHours: {
    start: {
      type: String, // Format: "HH:MM"
      required: true
    },
    end: {
      type: String, // Format: "HH:MM" 
      required: true
    }
  },
  slotDuration: {
    type: Number, // minutes
    default: 30,
    required: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster querying
DoctorAvailabilitySchema.index({ doctor: 1, date: 1 });
DoctorAvailabilitySchema.index({ doctor: 1, dayOfWeek: 1 });

module.exports = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema);
