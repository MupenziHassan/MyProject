import api from './api';

const adminService = {
  getAllUsers: async () => {
    return await api.get('/api/v1/admin/users');
  },
  
  createUser: async (userData) => {
    return await api.post('/api/v1/admin/users', userData);
  },
  
  updateUser: async (userId, userData) => {
    return await api.put(`/api/v1/admin/users/${userId}`, userData);
  },
  
  deleteUser: async (userId) => {
    return await api.delete(`/api/v1/admin/users/${userId}`);
  },
  
  getSystemSettings: async () => {
    return await api.get('/api/v1/admin/settings');
  },
  
  updateSystemSettings: async (settings) => {
    return await api.put('/api/v1/admin/settings', settings);
  },
  
  testEmailConfig: async (emailSettings) => {
    return await api.post('/api/v1/admin/settings/test-email', emailSettings);
  },
  
  getSystemStats: async () => {
    return await api.get('/api/v1/admin/stats');
  }
};

export default adminService;
