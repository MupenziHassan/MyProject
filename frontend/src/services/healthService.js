import axios from 'axios';
import { authHeader } from './authService';

// Get health dashboard data
export const getHealthDashboard = async () => {
  try {
    const response = await axios.get('/api/v1/patients/health-dashboard', { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Server error' };
  }
};

// Submit health information
export const submitHealthInfo = async (type, data) => {
  try {
    const response = await axios.post(`/api/v1/patients/health-information/${type}`, data, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Server error' };
  }
};

// Get appointments
export const getAppointments = async (status) => {
  try {
    const response = await axios.get('/api/v1/appointments/patient', {
      headers: authHeader(),
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Server error' };
  }
};

// Create appointment
export const createAppointment = async (data) => {
  try {
    const response = await axios.post('/api/v1/appointments', data, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Server error' };
  }
};

// Update appointment status
export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await axios.put(`/api/v1/appointments/${id}/status`, { status }, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Server error' };
  }
};
