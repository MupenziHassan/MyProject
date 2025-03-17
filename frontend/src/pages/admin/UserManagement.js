import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RegisterForm from '../../components/auth/RegisterForm';
import '../../styles/admin.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('patient');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    admins: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/users');
      setUsers(response.data.data);
      
      // Calculate statistics
      const counts = response.data.data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      
      setStats({
        patients: counts.patient || 0,
        doctors: counts.doctor || 0,
        admins: counts.admin || 0
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/api/v1/admin/users/${userId}`);
      // Update user list
      setUsers(users.filter(user => user._id !== userId));
      // Update stats
      const deletedUser = users.find(user => user._id === userId);
      if (deletedUser) {
        setStats(prev => ({
          ...prev,
          [deletedUser.role]: prev[deletedUser.role] - 1
        }));
      }
    } catch (err) {
      setError('Failed to delete user.');
    }
  };
  
  const handleBulkGenerate = async () => {
    try {
      setLoading(true);
      await axios.post('/api/v1/admin/users/bulk-generate', {
        userType: selectedUserType,
        count: bulkCount
      });
      
      // Refresh user list
      fetchUsers();
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to generate users. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Create, view, and manage users in the system</p>
      </div>
      
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.doctors}</div>
          <div className="stat-label">Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.admins}</div>
          <div className="stat-label">Administrators</div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="control-panel">
        {!showCreateForm ? (
          <div className="action-buttons">
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setShowCreateForm(true);
                setBulkMode(false);
              }}
            >
              <i className="fas fa-plus"></i> Create Single User
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setShowCreateForm(true);
                setBulkMode(true);
              }}
            >
              <i className="fas fa-users"></i> Bulk Generate Users
            </button>
          </div>
        ) : (
          <div className="create-form-container">
            <div className="form-header">
              <h2>{bulkMode ? 'Generate Multiple Users' : 'Create New User'}</h2>
              <button className="btn-close" onClick={() => setShowCreateForm(false)}>
                &times;
              </button>
            </div>
            
            <div className="user-type-selector">
              <label className={`user-type ${selectedUserType === 'patient' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="patient"
                  checked={selectedUserType === 'patient'}
                  onChange={() => setSelectedUserType('patient')}
                />
                <i className="fas fa-user"></i> Patient
              </label>
              
              <label className={`user-type ${selectedUserType === 'doctor' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="doctor"
                  checked={selectedUserType === 'doctor'}
                  onChange={() => setSelectedUserType('doctor')}
                />
                <i className="fas fa-user-md"></i> Doctor
              </label>
              
              <label className={`user-type ${selectedUserType === 'admin' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="admin"
                  checked={selectedUserType === 'admin'}
                  onChange={() => setSelectedUserType('admin')}
                />
                <i className="fas fa-user-shield"></i> Admin
              </label>
            </div>
            
            {bulkMode ? (
              <div className="bulk-generation-form">
                <div className="form-group">
                  <label htmlFor="bulkCount">Number of Users to Generate</label>
                  <input
                    type="number"
                    id="bulkCount"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                    min="1"
                    max="100"
                    className="form-control"
                  />
                </div>
                
                <button 
                  className="btn btn-primary" 
                  onClick={handleBulkGenerate}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Users'}
                </button>
                
                <div className="bulk-info">
                  <p>
                    <i className="fas fa-info-circle"></i>
                    This will create {bulkCount} {selectedUserType}(s) with automatically 
                    generated information and random health profiles.
                  </p>
                </div>
              </div>
            ) : (
              <RegisterForm 
                userType={selectedUserType} 
              />
            )}
          </div>
        )}
      </div>
      
      <div className="users-table-container">
        <h2>System Users</h2>
        {loading && !showCreateForm ? (
          <div className="loading">Loading users...</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      className="btn-icon" 
                      title="Edit user"
                      onClick={() => console.log('Edit', user._id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn-icon" 
                      title="View details"
                      onClick={() => console.log('View', user._id)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="btn-icon delete" 
                      title="Delete user"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
