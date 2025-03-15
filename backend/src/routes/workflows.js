const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  checkPermission, 
  ensureDoctorPatientRelationship, 
  ensureCancerSpecialization 
} = require('../middleware/permissions');

// Import controllers
const workflowController = require('../controllers/workflows');

// All routes are protected
router.use(protect);

// Cancer Screening Workflows - Doctors only
router.use('/cancer-screening', authorize('doctor'));
router.post(
  '/cancer-screening/initiate',
  checkPermission(['view_patients', 'order_tests']),
  ensureDoctorPatientRelationship,
  ensureCancerSpecialization,
  workflowController.initiateScreeningWorkflow
);
router.get(
  '/cancer-screening/:workflowId',
  checkPermission('view_patients'),
  workflowController.getScreeningWorkflow
);
router.put(
  '/cancer-screening/:workflowId/update-stage',
  checkPermission(['view_patients', 'manage_workflows']),
  ensureDoctorPatientRelationship,
  workflowController.updateWorkflowStage
);

// Treatment Workflows - Doctors only
router.use('/treatment', authorize('doctor'));
router.post(
  '/treatment/initiate',
  checkPermission(['view_patients', 'manage_treatments']),
  ensureDoctorPatientRelationship,
  workflowController.initiateTreatmentWorkflow
);
router.get(
  '/treatment/:workflowId',
  checkPermission('view_patients'),
  workflowController.getTreatmentWorkflow
);
router.put(
  '/treatment/:workflowId/update',
  checkPermission(['view_patients', 'manage_treatments']),
  ensureDoctorPatientRelationship,
  workflowController.updateTreatmentWorkflow
);

// Patient consent management - Both patients and doctors
router.post(
  '/consent/:workflowId',
  authorize('patient', 'doctor'),
  workflowController.manageConsent
);

// Workflow templates - Doctors and admins
router.get(
  '/templates',
  authorize('doctor', 'admin'),
  workflowController.getWorkflowTemplates
);
router.post(
  '/templates',
  authorize('admin'),
  workflowController.createWorkflowTemplate
);

module.exports = router;
