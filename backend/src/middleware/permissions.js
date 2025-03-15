// ...existing code...
        // Check if doctor is verified
        if (!doctor || !doctor.isVerified) {
          return res.status(403).json({
            success: false,
            error: 'Doctor account not verified. Verification required for clinical actions.'
          });
        }
        
        // Determine doctor's permissions based on specialization and verification status
        userPermissions = doctor.permissions || [];
        
        // All verified doctors get basic permissions
        if (doctor.isVerified) {
          userPermissions = [
            ...userPermissions,
            'view_patients',
            'order_tests',
            'view_test_results',
            'create_predictions'
          ];
        }
        
        // Oncologists get cancer-specific permissions
        if (doctor.specialization === 'oncology') {
          userPermissions.push('manage_cancer_treatments');
        }
        
      } else if (req.user.role === 'patient') {
        // Patients have permissions to their own data
        userPermissions = [
          'view_own_records',
          'manage_own_profile',
          'view_own_predictions',
          'view_own_appointments'
        ];
      }
      
      // Check if user has all required permissions
      const hasAllPermissions = permissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to perform this action'
        });
      }
      
      // Add permissions to request object for potential use in controllers
      req.permissions = userPermissions;
      next();
      
    } catch (err) {
      console.error('Permission check error:', err);
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };
};

/**
 * Middleware to ensure user only accesses their own patient data
 */
const ensureOwnPatientData = async (req, res, next) => {
  try {
    // Allow doctors and admins to access any patient data
    if (req.user.role === 'doctor' || req.user.role === 'admin') {
      return next();
    }
    
    // For patients, ensure they only access their own data
    const patientId = req.params.patientId || req.body.patient || req.query.patient;
    
    // If no patient ID in request, continue (may be handled in controller)
    if (!patientId) {
      return next();
    }
    
    // If patient is trying to access other patient's data
    if (req.user.role === 'patient' && patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only access your own medical data'
      });
    }
    
    next();
  } catch (err) {
    console.error('Patient data access check error:', err);
    return res.status(500).json({
      success: false,
      error: 'Error checking data access permissions'
    });
  }
};

/**
 * Middleware to check doctor-patient relationship
 * Ensures doctors only access data for their patients
 */
const ensureDoctorPatientRelationship = async (req, res, next) => {
  try {
    // Skip if user is admin
    if (req.user.role === 'admin') {
      return next();
    }
    
    // If not a doctor, skip (handled by other middleware)
    if (req.user.role !== 'doctor') {
      return next();
    }
    
    const patientId = req.params.patientId || req.body.patient || req.query.patient;
    
    // If no patient ID in request, continue
    if (!patientId) {
      return next();
    }
    
    // Check if doctor has relationship with this patient (appointments, tests ordered, etc.)
    const hasRelationship = await checkDoctorPatientRelationship(req.user.id, patientId);
    
    if (!hasRelationship) {
      return res.status(403).json({
        success: false,
        error: 'You do not have a doctor-patient relationship with this patient'
      });
    }
    
    next();
  } catch (err) {
    console.error('Doctor-patient relationship check error:', err);
    return res.status(500).json({
      success: false,
      error: 'Error checking doctor-patient relationship'
    });
  }
};

/**
 * Helper function to check if doctor has relationship with patient
 */
const checkDoctorPatientRelationship = async (doctorId, patientId) => {
  // Check for appointments, tests, predictions, etc.
  const Appointment = require('../models/Appointment');
  const Test = require('../models/Test');
  
  const appointmentExists = await Appointment.findOne({
    doctor: doctorId,
    patient: patientId
  });
  
  if (appointmentExists) return true;
  
  const testExists = await Test.findOne({
    doctor: doctorId,
    patient: patientId
  });
  
  if (testExists) return true;
  
  return false;
};

/**
 * Middleware to check if cancer specialist can access specific cancer type data
 */
const ensureCancerSpecialization = async (req, res, next) => {
  try {
    // Only apply to doctors
    if (!req.user || req.user.role !== 'doctor') {
      return next();
    }
    
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }
    
    // Get cancer type from request
    const cancerType = req.body.cancerType || req.query.cancerType;
    if (!cancerType) {
      return next();
    }
    
    // Mapping of cancer types to specializations
    const specializationMap = {
      'breast': ['oncology', 'surgical oncology', 'breast surgery'],
      'lung': ['oncology', 'pulmonology', 'thoracic surgery'],
      'colorectal': ['oncology', 'gastroenterology', 'colorectal surgery'],
      'prostate': ['oncology', 'urology'],
      'skin': ['oncology', 'dermatology']
    };
    
    // Ensure doctor specialization exists and convert to lowercase for comparison
    const doctorSpecialization = doctor.specialization ? doctor.specialization.toLowerCase() : '';
    
    const requiredSpecializations = specializationMap[cancerType.toLowerCase()];
    
    // If no mapping exists or doctor has right specialization, allow access
    if (!requiredSpecializations || 
        requiredSpecializations.includes(doctorSpecialization)) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: `This cancer type requires specialization in: ${requiredSpecializations.join(', ')}`
    });
    
  } catch (err) {
    console.error('Cancer specialization check error:', err);
    return res.status(500).json({
      success: false,
      error: 'Error checking specialization requirements'
    });
  }
};

module.exports = {
  checkPermission,
  ensureOwnPatientData,
  ensureDoctorPatientRelationship,
  ensureCancerSpecialization
};
