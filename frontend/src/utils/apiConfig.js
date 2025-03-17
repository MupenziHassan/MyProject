import axios from 'axios';

// Create an instance of axios with a base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiry
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { refreshToken }
        );
        
        // Store new tokens
        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update authorization header and retry
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out user
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login page
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Auth services
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    verifyEmail: (token) => api.post('/auth/verify-email', { token }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => 
      api.post('/auth/reset-password', { token, newPassword }),
  },

  // Patient services
  patients: {
    getStats: () => api.get('/patients/stats'),
    getAppointments: (params) => api.get('/patients/appointments', { params }),
    getAssessments: (params) => api.get('/patients/assessments', { params }),
    getMedications: () => api.get('/patients/medications'),
    getHealthMetrics: (metricType) => api.get(`/patients/health-metrics/${metricType || ''}`),
    
    // Health metrics submissions
    addHealthMetric: (metricData) => api.post('/patients/health-metrics', metricData),
    updateHealthMetric: (metricId, metricData) => api.put(`/patients/health-metrics/${metricId}`, metricData),
    
    // Health data upload
    uploadHealthData: (formData) => api.post('/patients/health-data', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Medication tracking
    updateMedicationStatus: (medicationId, status) => 
      api.put(`/patients/medications/${medicationId}/status`, status),
    
    // Appointments
    scheduleAppointment: (appointmentData) => api.post('/appointments', appointmentData),
    cancelAppointment: (appointmentId) => api.put(`/appointments/${appointmentId}/cancel`),
    rescheduleAppointment: (appointmentId, newDateTime) => 
      api.put(`/appointments/${appointmentId}/reschedule`, { dateTime: newDateTime }),
  },

  // Doctor services
  doctors: {
    getPatients: (params) => api.get('/doctors/patients', { params }),
    getAppointments: (params) => api.get('/doctors/appointments', { params }),
    getPatientDetail: (patientId) => api.get(`/doctors/patients/${patientId}`),
    getPatientAssessments: (patientId) => api.get(`/doctors/patients/${patientId}/assessments`),
    
    // Assessment management
    createAssessment: (patientId, assessmentData) => 
      api.post(`/doctors/patients/${patientId}/assessments`, assessmentData),
    updateAssessment: (assessmentId, assessmentData) => 
      api.put(`/doctors/assessments/${assessmentId}`, assessmentData),
    
    // Appointment management
    confirmAppointment: (appointmentId) => api.put(`/doctors/appointments/${appointmentId}/confirm`),
    completeAppointment: (appointmentId, notes) => 
      api.put(`/doctors/appointments/${appointmentId}/complete`, { notes }),
  },

  // Common services
  messages: {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
    sendMessage: (conversationId, content) => 
      api.post(`/messages/conversations/${conversationId}`, { content }),
    createConversation: (recipientId, initialMessage) => 
      api.post('/messages/conversations', { recipientId, initialMessage }),
  },

  // Health education resources
  education: {
    getResources: (params) => api.get('/education/resources', { params }),
    getResourceById: (resourceId) => api.get(`/education/resources/${resourceId}`),
    getCampaigns: () => api.get('/education/campaigns'),
  },

  // Error handling wrapper
  async request(apiCall) {
    try {
      const response = await apiCall();
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        data: null,
        error: {
          message: error.response?.data?.message || error.message || 'Unknown error occurred',
          status: error.response?.status || 500
        }
      };
    }
  }
};

export default apiService;
