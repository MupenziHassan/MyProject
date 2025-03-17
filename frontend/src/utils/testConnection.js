import api from '../services/api';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await api.get('/api/v1');
    console.log('Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Backend connection failed:', error);
    return { 
      success: false, 
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    };
  }
};
