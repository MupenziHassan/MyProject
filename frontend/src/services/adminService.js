import api from './api';

const adminService = {
  // User management
  getAllUsers: async () => {
    return await api.get('/api/v1/admin/users');
  },
  
  getUserById: async (userId) => {
    return await api.get(`/api/v1/admin/users/${userId}`);
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
  
  // Dashboard statistics
  getDashboardStats: async () => {
    return await api.get('/api/v1/admin/stats');
  },

  // Settings management
  getSystemSettings: async () => {
    return await api.get('/api/v1/admin/settings');
  },

  updateSystemSettings: async (settings) => {
    return await api.put('/api/v1/admin/settings', settings);
  },

  testEmailConfig: async (emailSettings) => {
    return await api.post('/api/v1/admin/settings/test-email', emailSettings);
  }
};

export default adminService;
