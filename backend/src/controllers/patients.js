const Patient = require('../models/Patient');
const User = require('../models/User');
const Test = require('../models/Test');
const Prediction = require('../models/Prediction');

// @desc    Get current patient profile
// @route   GET /api/v1/patients/me
// @access  Private (Patient)
exports.getCurrentPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'name email');

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update patient profile
// @route   POST /api/v1/patients
// @access  Private (Patient)
exports.createUpdatePatient = async (req, res, next) => {
  try {
    let patient = await Patient.findOne({ user: req.user.id });

    if (patient) {
      // Update existing profile
      patient = await Patient.findOneAndUpdate(
        { user: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      req.body.user = req.user.id;
      patient = await Patient.create(req.body);
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get patient's test results
// @route   GET /api/v1/patients/tests
// @access  Private (Patient)
exports.getPatientTests = async (req, res, next) => {
  try {
    const tests = await Test.find({ patient: req.user.id })
      .sort({ date: -1 })
      .populate('doctor', 'name');

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get patient's prediction results
// @route   GET /api/v1/patients/predictions
// @access  Private (Patient)
exports.getPatientPredictions = async (req, res, next) => {
  try {
    const predictions = await Prediction.find({ patient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('test')
      .populate('doctor', 'name');

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add medical history item
// @route   POST /api/v1/patients/medical-history
// @access  Private (Patient)
exports.addMedicalHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    patient.medicalHistory.unshift(req.body);
    await patient.save();

    res.status(200).json({
      success: true,
      data: patient.medicalHistory
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add allergy
// @route   POST /api/v1/patients/allergies
// @access  Private (Patient)
exports.addAllergy = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    patient.allergies.unshift(req.body);
    await patient.save();

    res.status(200).json({
      success: true,
      data: patient.allergies
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add family history item
// @route   POST /api/v1/patients/family-history
// @access  Private (Patient)
exports.addFamilyHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    patient.familyHistory.unshift(req.body);
    await patient.save();

    res.status(200).json({
      success: true,
      data: patient.familyHistory
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update lifestyle information
// @route   PUT /api/v1/patients/lifestyle
// @access  Private (Patient)
exports.updateLifestyle = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    patient.lifestyle = req.body;
    await patient.save();

    res.status(200).json({
      success: true,
      data: patient.lifestyle
    });
  } catch (err) {
    next(err);
  }
};
