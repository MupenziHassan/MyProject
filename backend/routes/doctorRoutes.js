const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
// Fix the import to properly destructure auth and checkRole
const { auth, checkRole } = require('../middleware/auth');

// Doctor routes
router.get('/profile', auth, checkRole(['doctor']), doctorController.getProfile);
router.put('/profile', auth, checkRole(['doctor']), doctorController.updateProfile);

// Patient management
router.get('/patients', auth, checkRole(['doctor']), doctorController.getPatients);
router.post('/patients', auth, checkRole(['doctor']), doctorController.createPatient);
router.get('/patients/:id', auth, checkRole(['doctor']), doctorController.getPatient);

// Create a new assessment for a patient
router.post('/assessments', auth, checkRole(['doctor']), async (req, res) => {
  try {
    const { patientId, patientName, height, weight, riskAssessment, doctorId, ...assessmentData } = req.body;
    
    // Create new assessment
    const newAssessment = new Assessment({
      patientId,
      doctorId,
      height,
      weight,
      riskAssessment,
      ...assessmentData,
      date: new Date()
    });
    
    // Save assessment to database
    await newAssessment.save();
    
    // Update patient's health data
    await Patient.findByIdAndUpdate(patientId, {
      $set: { height, weight },
      $push: { assessments: newAssessment._id }
    });
    
    // Create notification for patient
    const notification = new Notification({
      userId: patientId,
      title: 'New Health Assessment',
      message: `Dr. ${req.user.name} has completed your health assessment. View your results now.`,
      type: 'assessment',
      referenceId: newAssessment._id
    });
    
    await notification.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Assessment created successfully',
      data: newAssessment
    });
    
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all assessments by doctor
router.get('/assessments', auth, checkRole(['doctor']), async (req, res) => {
  try {
    const { status, risk } = req.query;
    const query = { doctorId: req.user.id };
    
    if (status) query.status = status;
    if (risk && risk === 'high') {
      query['riskAssessment.cancerRiskLevel'] = 'High';
    }
    
    const assessments = await Assessment.find(query)
      .populate('patientId', 'name email')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
    
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
