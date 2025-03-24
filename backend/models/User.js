const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Additional patient-specific fields
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  dateOfBirth: {
    type: Date
  },
  contactNumber: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String
  },
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    pastSurgeries: [String]
  },
  assessments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    }
  ],
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  ],
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}; // Fixed missing closing parenthesis here

module.exports = mongoose.model('User', UserSchema);
