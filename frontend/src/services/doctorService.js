import apiConnection from '../utils/apiConnection';

const doctorService = {
  // Get doctor profile
  getProfile: async () => {
    try {
      const response = await apiConnection.get('/doctors/profile');
      return response;
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch doctor profile' 
      };
    }
  },
  
  // Update doctor profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiConnection.put('/doctors/profile', profileData);
      return response;
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update doctor profile' 
      };
    }
  },
  
  // Get all patients
  getPatients: async (query = '') => {
    try {
      const params = query ? { query } : {};
      const response = await apiConnection.get('/doctors/patients', params);
      return response;
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch patients' 
      };
    }
  },
  
  // Get specific patient
  getPatient: async (patientId) => {
    try {
      const response = await apiConnection.get(`/doctors/patients/${patientId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching patient ${patientId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch patient' 
      };
    }
  },
  
  // Get patient medical records
  getPatientMedicalRecords: async (patientId) => {
    try {
      const response = await apiConnection.get(`/doctors/patients/${patientId}/medical-records`);
      return response;
    } catch (error) {
      console.error(`Error fetching medical records for patient ${patientId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch medical records' 
      };
    }
  },
  
  // Add medical record
  addMedicalRecord: async (patientId, recordData) => {
    try {
      const response = await apiConnection.post(`/doctors/patients/${patientId}/medical-records`, recordData);
      return response;
    } catch (error) {
      console.error(`Error adding medical record for patient ${patientId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add medical record' 
      };
    }
  },
  
  // Get appointments
  getAppointments: async (status = '', date = '') => {
    try {
      const params = {};
      if (status) params.status = status;
      if (date) params.date = date;
      
      const response = await apiConnection.get('/doctors/appointments', params);
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch appointments' 
      };
    }
  },
  
  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status, notes = '') => {
    try {
      const response = await apiConnection.put(`/doctors/appointments/${appointmentId}/status`, { status, notes });
      return response;
    } catch (error) {
      console.error(`Error updating appointment ${appointmentId} status:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update appointment status' 
      };
    }
  },
  
  // Set availability
  setAvailability: async (availabilityData) => {
    try {
      const response = await apiConnection.post('/doctors/availability', availabilityData);
      return response;
    } catch (error) {
      console.error('Error setting availability:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to set availability' 
      };
    }
  },
  
  // Get availability
  getAvailability: async (month = '', year = '') => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      
      const response = await apiConnection.get('/doctors/availability', params);
      return response;
    } catch (error) {
      console.error('Error fetching availability:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch availability' 
      };
    }
  },
  
  // Create treatment plan
  createTreatmentPlan: async (patientId, planData) => {
    try {
      const response = await apiConnection.post(`/doctors/patients/${patientId}/treatment-plans`, planData);
      return response;
    } catch (error) {
      console.error(`Error creating treatment plan for patient ${patientId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create treatment plan' 
      };
    }
  },
  
  // Order test
  orderTest: async (patientId, testData) => {
    try {
      const response = await apiConnection.post(`/doctors/patients/${patientId}/tests`, testData);
      return response;
    } catch (error) {
      console.error(`Error ordering test for patient ${patientId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to order test' 
      };
    }
  },
  
  // Perform risk assessment
  performRiskAssessment: async (patientId, assessmentData) => {
    try {
      const response = await apiConnection.post(`/doctors/patients/${patientId}/risk-assessment`, assessmentData);
      return response;
    } catch (error) {
      console.error(`Error performing risk assessment for patient ${patientId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to perform risk assessment' 
      };
    }
  },
  
  // Get dashboard data
  getDashboardData: async () => {
    try {
      const response = await apiConnection.get('/doctors/dashboard');
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

export default doctorService;
