const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

// Basic doctor controller functions
const doctorController = {
  // Get doctor profile
  getProfile: async (req, res) => {
    try {
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
        error: 'A user with this email already exists'
      });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create the user account
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      dob: dob ? new Date(dob) : undefined,
      role: 'patient',
      requirePasswordChange: true,
      active: true,
      createdBy: req.user.id // The doctor creating this patient
    });

    const savedUser = await newUser.save();

    // Create the patient profile
    const patientProfile = new Patient({
      userId: savedUser._id,
      address: { street: address },
      emergencyContact: {
        name: emergencyContact,
        relationship,
        phone: emergencyPhone
      },
      medicalHistory: medicalHistory ? medicalHistory.split(',').map(item => ({
        condition: item.trim(),
        diagnosedDate: new Date()
      })) : [],
      createdBy: req.user.id, // The doctor creating this patient
      primaryDoctor: req.user.id // Set creating doctor as primary
    });

    await patientProfile.save();

    // Find the doctor's profile to include in the response
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });

    return res.status(201).json({
      success: true,
      data: {
        message: 'Patient created successfully',
        patient: {
          ...savedUser.toObject(),
          temporaryPassword: tempPassword, // Include the temp password in the response
          patientProfile: patientProfile.toObject(),
          primaryDoctor: doctorProfile ? {
            id: doctorProfile._id,
            name: req.user.name,
            specialization: doctorProfile.specialization
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error creating patient',
      details: error.message
    });
  }
};

/**
 * @desc    Get doctor's patients
 * @route   GET /api/v1/doctors/patients
 * @access  Private (Doctor)
 */
exports.getDoctorPatients = async (req, res) => {
  try {
    // Find all patients where this doctor is the primary or has created them
    const patients = await Patient.find({
      $or: [
        { primaryDoctor: req.user.id },
        { createdBy: req.user.id }
      ]
    }).populate('userId', 'name email phone gender dob');

    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching patients',
      details: error.message
    });
  }
};