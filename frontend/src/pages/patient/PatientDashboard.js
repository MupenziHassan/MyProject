import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const PatientDashboard = () => {
  const { auth } = useContext(AuthContext);
  
  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome, {auth && auth.user ? auth.user.name : 'Patient'}</h1>
        <p className="welcome-message">
          Here's an overview of your health information and upcoming appointments.
        </p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-content">
            <div className="action-buttons">
              <Link to="/patient/appointments/schedule" className="action-button">
                <i className="fas fa-calendar-plus"></i>
                <span>Schedule Appointment</span>
              </Link>
              
              <Link to="/patient/health-data/submit" className="action-button">
                <i className="fas fa-notes-medical"></i>
                <span>Submit Health Data</span>
              </Link>
              
              <Link to="/patient/health-dashboard" className="action-button">
                <i className="fas fa-heartbeat"></i>
                <span>View Health Dashboard</span>
              </Link>
              
              <Link to="/patient/appointments" className="action-button">
                <i className="fas fa-calendar-alt"></i>
                <span>View Appointments</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Next Appointment</h2>
            <Link to="/patient/appointments" className="card-link">View All</Link>
          </div>
          <div className="card-content">
            <div className="upcoming-appointment">
              <p className="no-data-message">No upcoming appointments.</p>
              <Link to="/patient/appointments/schedule" className="btn btn-primary">
                Schedule Now
              </Link>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Health Metrics</h2>
            <Link to="/patient/health-dashboard" className="card-link">View Details</Link>
          </div>
          <div className="card-content">
            <div className="metrics-overview">
              <p className="no-data-message">No recent health metrics available.</p>
              <Link to="/patient/health-data/submit" className="btn btn-primary">
                Submit Health Data
              </Link>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Important Notifications</h2>
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

export default PatientDashboard;
