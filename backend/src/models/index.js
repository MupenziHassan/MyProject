/**
 * Models Index File
 * Centralizes exports of all models for easier importing elsewhere
 */

// User related models
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');

// Medical record related models
const MedicalRecord = require('./MedicalRecord');
const Test = require('./Test');
const VitalRecord = require('./VitalRecord');
const Medication = require('./Medication');
const TreatmentPlan = require('./TreatmentPlan');
const HealthAssessment = require('./HealthAssessment');

// Scheduling and communication models
const Appointment = require('./Appointment');
const Message = require('./Message');
const Notification = require('./Notification');

// Prediction and ML models
const Prediction = require('./Prediction');
const ModelVersion = require('./ModelVersion');

// Content and education models
const EducationMaterial = require('./EducationMaterial');

// Export all models
module.exports = {
  User,
  Patient,
  Doctor,
  MedicalRecord,
  Test,
  VitalRecord,
  Medication,
  TreatmentPlan,
  HealthAssessment,
  Appointment,
  Message,
  Notification,
  Prediction,
  ModelVersion,
  EducationMaterial
};
