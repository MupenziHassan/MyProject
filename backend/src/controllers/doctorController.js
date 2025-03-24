const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Assessment = require('../models/Assessment');
const bcrypt = require('bcryptjs');

// Create a new patient
exports.createPatient = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      gender, 
      dob, 
      address, 
      emergencyContact, 
      relationship,
      emergencyPhone,
      medicalHistory 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create a temporary random password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'patient',
    });

    // Convert medical history string to array if provided
    let medicalHistoryArray = [];
    if (medicalHistory) {
      if (Array.isArray(medicalHistory)) {
        medicalHistoryArray = medicalHistory;
      } else if (typeof medicalHistory === 'string') {
        medicalHistoryArray = medicalHistory.split(',').map(item => item.trim());
      }
    }

    // Create patient profile
    const patient = await Patient.create({
      userId: user._id,
      gender,
      dateOfBirth: dob,
      phone,
      address,
      emergencyContact: {
        name: emergencyContact,
        relationship,
        phone: emergencyPhone
      },
      medicalHistory: medicalHistoryArray,
      referringDoctor: req.user.id // The doctor who is creating this patient
    });

    // Send email with temporary password
    // ... email sending code would go here ...

    res.status(201).json({
      success: true,
      data: {
        patient: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        tempPassword
      },
      message: 'Patient created successfully. A temporary password has been generated.'
    });
  } catch (error) {
    console.error('Doctor create patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create patient. Please try again.'
    });
  }
};
