import api from './api';

const patientService = {
  // Dashboard data
  getDashboardData: async () => {
    return await api.get('/api/v1/patients/dashboard');
  },
  
  // Health assessments
  getHealthAssessments: async () => {
    return await api.get('/api/v1/patients/health-assessments');
  },
  
  submitHealthAssessment: async (assessmentData) => {
    return await api.post('/api/v1/patients/health-assessments', assessmentData);
  },
  
  getHealthAssessmentById: async (assessmentId) => {
    return await api.get(`/api/v1/patients/health-assessments/${assessmentId}`);
  },
  
  // Appointments
  getAppointments: async () => {
    return await api.get('/api/v1/patients/appointments');
  },
  
  getAppointmentById: async (appointmentId) => {
    return await api.get(`/api/v1/patients/appointments/${appointmentId}`);
  },
  
  scheduleAppointment: async (appointmentData) => {
    return await api.post('/api/v1/patients/appointments', appointmentData);
  },
  
  cancelAppointment: async (appointmentId) => {
    return await api.put(`/api/v1/patients/appointments/${appointmentId}/cancel`);
  },
  
  // Get available doctors for appointment scheduling
  getAvailableDoctors: async () => {
    return await api.get('/api/v1/patients/doctors');
  }
};

export default patientService;
