import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { authHeader } from '../../services/authService';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // This is a placeholder - in a real app, you would have an admin-specific API endpoint
        const response = await axios.get('/api/v1/admin/dashboard', {
          headers: authHeader()
        });
        
        if (response.data.success) {
          setStats(response.data.data.stats || {
            totalPatients: 0,
            totalDoctors: 0,
            totalAppointments: 0,
            activeUsers: 0
          });
        }
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome, {auth && auth.user ? auth.user.name : 'Admin'}</h1>
        <p className="welcome-message">
          Here's an overview of the system and key metrics.
        </p>
      </div>
      
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-injured"></i>
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalPatients}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalDoctors}</div>
            <div className="stat-label">Total Doctors</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalAppointments}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-content">
            <div className="action-buttons">
              <Link to="/admin/users" className="action-button">
                <i className="fas fa-users-cog"></i>
                <span>Manage Users</span>
              </Link>
              
              <Link to="/admin/appointments" className="action-button">
                <i className="fas fa-calendar-alt"></i>
                <span>View Appointments</span>
              </Link>
              
              <Link to="/admin/settings" className="action-button">
                <i className="fas fa-cog"></i>
                <span>System Settings</span>
              </Link>
              
              <Link to="/admin/reports" className="action-button">
                <i className="fas fa-chart-bar"></i>
                <span>Reports</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="loading">Loading activities...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="activities-list">
                <p className="no-data-message">No recent activities.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>System Notifications</h2>
          </div>
          <div className="card-content">
            <div className="notifications-list">
              <p className="no-data-message">No new notifications.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
