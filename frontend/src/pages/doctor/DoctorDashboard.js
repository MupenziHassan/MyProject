import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { authHeader } from '../../services/authService';
import '../../styles/Dashboard.css';

const DoctorDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // This is a placeholder - in a real app, you would have a doctor-specific API endpoint
        const response = await axios.get('/api/v1/doctor/dashboard', {
          headers: authHeader()
        });
        
        if (response.data.success) {
          setTodayAppointments(response.data.data.todayAppointments || []);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome, Dr. {auth && auth.user ? auth.user.name : 'Doctor'}</h1>
        <p className="welcome-message">
          Here's an overview of your schedule and patient appointments for today.
        </p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-content">
            <div className="action-buttons">
              <Link to="/doctor/appointments" className="action-button">
                <i className="fas fa-calendar-alt"></i>
                <span>Manage Appointments</span>
              </Link>
              
              <Link to="/doctor/patients" className="action-button">
                <i className="fas fa-user-injured"></i>
                <span>View Patients</span>
              </Link>
              
              <Link to="/doctor/availability" className="action-button">
                <i className="fas fa-clock"></i>
                <span>Set Availability</span>
              </Link>
              
              <Link to="/doctor/profile" className="action-button">
                <i className="fas fa-user-md"></i>
                <span>Update Profile</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Today's Appointments</h2>
            <Link to="/doctor/appointments" className="card-link">View All</Link>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="loading">Loading appointments...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : todayAppointments.length === 0 ? (
              <p className="no-data-message">No appointments scheduled for today.</p>
            ) : (
              <div className="today-appointments">
                {/* This would be populated with real data from the API */}
                <p className="no-data-message">No appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
          </div>
          <div className="card-content">
            <div className="activities-list">
              <p className="no-data-message">No recent activities.</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Patient Notifications</h2>
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

export default DoctorDashboard;
