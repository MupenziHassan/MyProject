import apiConnection from '../utils/apiConnection';

const patientService = {
  // Get patient profile
  getProfile: async () => {
    try {
      const response = await apiConnection.get('/patients/profile');
      return response;
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch patient profile' 
      };
    }
  },
  
  // Update patient profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiConnection.put('/patients/profile', profileData);
      return response;
    } catch (error) {
      console.error('Error updating patient profile:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update patient profile' 
      };
    }
  },
  
  // Get patient medical records
  getMedicalRecords: async () => {
    try {
      const response = await apiConnection.get('/patients/medical-records');
      return response;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch medical records' 
      };
    }
  },
  
  // Get specific medical record
  getMedicalRecord: async (recordId) => {
    try {
      const response = await apiConnection.get(`/patients/medical-records/${recordId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching medical record ${recordId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch medical record' 
      };
    }
  },
  
  // Get patient appointments
  getAppointments: async (status = '') => {
    try {
      const params = status ? { status } : {};
      const response = await apiConnection.get('/patients/appointments', params);
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch appointments' 
      };
    }
  },
  
  // Schedule new appointment
  scheduleAppointment: async (appointmentData) => {
    try {
      const response = await apiConnection.post('/patients/appointments', appointmentData);
      return response;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to schedule appointment' 
      };
    }
  },
  
  // Cancel appointment
  cancelAppointment: async (appointmentId, reason) => {
    try {
      const response = await apiConnection.put(`/patients/appointments/${appointmentId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error(`Error canceling appointment ${appointmentId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to cancel appointment' 
      };
    }
  },
  
  // Get vital signs
  getVitalSigns: async (type = '', limit = 10) => {
    try {
      const params = { limit };
      if (type) params.type = type;
      
      const response = await apiConnection.get('/patients/vitals', params);
      return response;
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch vital signs' 
      };
    }
  },
  
  // Add vital sign record
  addVitalSign: async (vitalData) => {
    try {
      const response = await apiConnection.post('/patients/vitals', vitalData);
      return response;
    } catch (error) {
      console.error('Error adding vital sign:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add vital sign' 
      };
    }
  },
  
  // Get medications
  getMedications: async (status = '') => {
    try {
      const params = status ? { status } : {};
      const response = await apiConnection.get('/patients/medications', params);
      return response;
    } catch (error) {
      console.error('Error fetching medications:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch medications' 
      };
    }
  },
  
  // Get health assessments
  getHealthAssessments: async () => {
    try {
      const response = await apiConnection.get('/patients/health-assessments');
      return response;
    } catch (error) {
      console.error('Error fetching health assessments:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch health assessments' 
      };
    }
  },
  
  // Submit health assessment
  submitHealthAssessment: async (assessmentData) => {
    try {
      const response = await apiConnection.post('/patients/health-assessments', assessmentData);
      return response;
    } catch (error) {
      console.error('Error submitting health assessment:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to submit health assessment' 
      };
    }
  },
  
  // Get dashboard data
  getDashboardData: async () => {
    try {
      const response = await apiConnection.get('/patients/dashboard');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch dashboard data' 
      };
    }
  }
};

export default patientService;
