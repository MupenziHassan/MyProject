import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const AdminProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    role: currentUser?.role || 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.put('/api/v1/users/profile', profile);
      setSuccess('Profile updated successfully');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="admin-profile">
      <h2>Admin Profile</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <input
            type="text"
            id="role"
            value={profile.role}
            className="form-control"
            disabled
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default AdminProfile;
