const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Test = require('../models/Test');
const Prediction = require('../models/Prediction');
const Appointment = require('../models/Appointment');

// @desc    Get current doctor profile
// @route   GET /api/v1/doctors/me
// @access  Private (Doctor)
exports.getCurrentDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update doctor profile
// @route   POST /api/v1/doctors
// @access  Private (Doctor)
exports.createUpdateDoctor = async (req, res, next) => {
  try {
    let doctor = await Doctor.findOne({ user: req.user.id });

    if (doctor) {
      // Update existing profile
      doctor = await Doctor.findOneAndUpdate(
        { user: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      req.body.user = req.user.id;
      doctor = await Doctor.create(req.body);
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload verification documents
// @route   POST /api/v1/doctors/verification
// @access  Private (Doctor)
exports.uploadVerification = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }

    // In a real app, handle file upload with multer and cloud storage
    const document = {
      documentType: req.body.documentType,
      documentUrl: req.body.documentUrl, // In real app, this would be a URL to the uploaded file
      uploadedAt: Date.now()
    };

    doctor.verificationDocuments.push(document);
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor.verificationDocuments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all patients for the doctor
// @route   GET /api/v1/doctors/patients
// @access  Private (Doctor)
exports.getPatients = async (req, res, next) => {
  try {
    // Find all appointments for this doctor to get unique patients
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate({
        path: 'patient',
        select: 'name email'
      });
    
    // Extract unique patients
    const uniquePatients = {};
    appointments.forEach(appointment => {
      uniquePatients[appointment.patient._id] = appointment.patient;
    });
    
    const patients = Object.values(uniquePatients);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get patient details
// @route   GET /api/v1/doctors/patients/:patientId
// @access  Private (Doctor)
exports.getPatientDetails = async (req, res, next) => {
  try {
    // Verify patient has appointments with this doctor
    const hasAppointment = await Appointment.findOne({
      doctor: req.user.id,
      patient: req.params.patientId
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this patient'
      });
    }

    // Get patient details
    const user = await User.findById(req.params.patientId).select('-password');
    const patientProfile = await Patient.findOne({ user: req.params.patientId });

    if (!user || !patientProfile) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Get tests and predictions for this patient
    const tests = await Test.find({ patient: req.params.patientId, doctor: req.user.id });
    const predictions = await Prediction.find({ patient: req.params.patientId, doctor: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        user,
        patientProfile,
        tests,
        predictions
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Order a new test
// @route   POST /api/v1/doctors/tests
// @access  Private (Doctor)
exports.orderTest = async (req, res, next) => {
  try {
    // Verify patient has appointments with this doctor
    const hasAppointment = await Appointment.findOne({
      doctor: req.user.id,
      patient: req.body.patient
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to order tests for this patient'
      });
    }

    // Create test order
    req.body.doctor = req.user.id;
    const test = await Test.create(req.body);

    res.status(201).json({
      success: true,
      data: test
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update test results
// @route   PUT /api/v1/doctors/tests/:testId
// @access  Private (Doctor)
exports.updateTestResults = async (req, res, next) => {
  try {
    let test = await Test.findById(req.params.testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Verify the test belongs to this doctor
    if (test.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this test'
      });
    }

    test = await Test.findByIdAndUpdate(
      req.params.testId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create prediction
// @route   POST /api/v1/doctors/predictions
// @access  Private (Doctor)
exports.createPrediction = async (req, res, next) => {
  try {
    // Verify the test belongs to this doctor
    const test = await Test.findById(req.body.test);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    if (test.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create predictions for this test'
      });
    }

    // Create prediction
    req.body.doctor = req.user.id;
    req.body.patient = test.patient;
    const prediction = await Prediction.create(req.body);

    res.status(201).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/v1/doctors/appointments
// @access  Private (Doctor)
exports.getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .sort({ date: 1 })
      .populate({
        path: 'patient',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment status
// @route   PUT /api/v1/doctors/appointments/:appointmentId
// @access  Private (Doctor)
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Verify the appointment belongs to this doctor
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this appointment'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};
