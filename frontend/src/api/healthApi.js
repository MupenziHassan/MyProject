import axios from 'axios';

// Base URL for API requests
const baseURL = '/api/v1';

// Create axios instance with base URL
const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Health information endpoints
export const submitHealthMetrics = (data) => api.post('/patients/health-information/general', data);

export const submitSymptoms = (data) => api.post('/patients/health-information/symptoms', data);

export const submitRiskFactors = (data) => api.post('/patients/health-information/cancerRisk', data);

export const getHealthMetrics = (type, period) => 
  api.get(`/patients/health-information/${type}`, { params: { period } });

// Appointments endpoints
export const getAppointments = (status) => 
  api.get(`/appointments/patient`, { params: { status } });

export const getAppointmentById = (id) => api.get(`/appointments/${id}`);

export const createAppointment = (data) => api.post('/appointments', data);

export const updateAppointmentStatus = (id, status) => 
  api.put(`/appointments/${id}/status`, { status });

// Doctor availability endpoints
export const getDoctorAvailability = (doctorId, startDate, endDate) => 
  api.get(`/appointments/availability/${doctorId}`, {
    params: { startDate, endDate }
  });

export const getAvailableTimeSlots = (doctorId, date) => 
  api.get(`/appointments/availability/${doctorId}/slots`, {
    params: { date }
  });

// Health dashboard data
export const getHealthDashboardData = () => api.get('/patients/health-dashboard');

// Risk assessment endpoints
export const submitHealthAssessment = (data) => api.post('/patients/health-assessment', data);

export const getRiskPredictions = () => api.get('/patients/predictions');

export const getPredictionById = (id) => api.get(`/patients/predictions/${id}`);

// Test results endpoints
export const getTestResults = () => api.get('/patients/test-results');

export const getTestResultById = (id) => api.get(`/patients/test-results/${id}`);

export default api;
