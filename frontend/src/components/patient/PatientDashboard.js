import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import PatientTimeline from '../shared/PatientTimeline';
import PredictionVisualizer from '../shared/PredictionVisualizer';
import LoadingSpinner from '../common/LoadingSpinner';

const PatientDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    recentTests: [],
    predictions: [],
    appointments: [],
    notifications: []
  });

  // Format timeline events from various sources
  const timelineEvents = [
    ...dashboardData.recentTests.map(test => ({
      id: test._id,
      type: 'test',
      title: test.name || 'Medical Test',
      description: test.description,
      date: test.date || test.createdAt || new Date(),
      provider: test.doctor?.name || 'Unknown Provider',
      status: test.status || 'unknown',
      link: `/tests/${test._id}`
    })),
    ...dashboardData.predictions.map(prediction => ({
      id: prediction._id,
      type: 'prediction',
      title: `${prediction.condition || 'Health'} Risk Assessment`,
      description: `Risk level: ${prediction.riskLevel || 'unknown'}`,
      date: prediction.createdAt || new Date(),
      provider: prediction.doctor?.name || 'Unknown Provider',
      link: `/predictions/${prediction._id}`
    })),
    ...dashboardData.appointments.map(appointment => ({
      id: appointment._id,
      type: 'appointment',
      title: appointment.reason || 'Medical Appointment',
      description: `${appointment.type || 'Office'} appointment with Dr. ${appointment.doctor?.name || 'Unknown'}`,
      date: appointment.date || appointment.createdAt || new Date(),
      location: appointment.location || 'Not specified',
      status: appointment.status || 'scheduled',
      link: `/appointments/${appointment._id}`
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get the most recent prediction with null check
  const latestPrediction = dashboardData.predictions && dashboardData.predictions.length > 0 ? dashboardData.predictions[0] : null;

  // Safe date formatting function
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  
  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <div className="greeting">Welcome back, {currentUser?.name || 'Patient'}</div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Health Summary Card */}
          {/* ...existing code... */}
          
          {/* Latest Risk Assessment/Prediction */}
          {latestPrediction && (
            <div className="card prediction-card">
              <div className="card-header">
                <h3><i className="fas fa-chart-pie"></i> Latest Risk Assessment</h3>
              </div>
              <div className="card-body">
                <PredictionVisualizer prediction={latestPrediction} showDetails={false} />
                <div className="card-actions">
                  <Link to={`/predictions/${latestPrediction._id}`} className="btn btn-outline">
                    View Full Assessment
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Upcoming Appointments */}
          <div className="card appointments-card">
            {/* ...existing code... */}
            <div className="card-body">
              {!dashboardData.appointments || dashboardData.appointments.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-calendar-times"></i>
                  <p>No upcoming appointments</p>
                  <Link to="/patient/appointments/schedule" className="btn btn-primary btn-sm">
                    Schedule an Appointment
                  </Link>
                </div>
              ) : (
                <div className="appointments-list">
                  {dashboardData.appointments.map(appointment => (
                    <div key={appointment._id || `appointment-${Math.random()}`} className="appointment-item">
                      <div className="appointment-date">
                        <div className="date-day">
                          {appointment.date ? new Date(appointment.date).getDate() : '--'}
                        </div>
                        <div className="date-month">
                          {appointment.date ? new Date(appointment.date).toLocaleString('default', { month: 'short' }) : '--'}
                        </div>
                      </div>
                      <div className="appointment-details">
                        <h4>{appointment.reason || 'Medical Appointment'}</h4>
                        <p>
                          <i className="far fa-clock"></i>
                          {appointment.date ? formatTime(appointment.date) : 'Time not set'}
                        </p>
                        <p>
                          <i className="fas fa-user-md"></i>
                          Dr. {appointment.doctor?.name || 'Unknown'}
                        </p>
                        <span className={`appointment-status status-${appointment.status || 'scheduled'}`}>
                          {appointment.status || 'Scheduled'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Medical Timeline */}
          <div className="card timeline-card">
            <div className="card-header">
              <h3><i className="fas fa-history"></i> Medical Timeline</h3>
            </div>
            <div className="card-body">
              <PatientTimeline events={timelineEvents} />
            </div>
          </div>
        </div>
        
        <div className="dashboard-sidebar">
          {/* Notifications */}
          <div className="card notifications-card">
            <div className="card-header">
              <h3><i className="fas fa-bell"></i> Notifications</h3>
              <Link to="/patient/notifications" className="btn btn-text">
                View All
              </Link>
            </div>
            <div className="card-body">
              {!dashboardData.notifications || dashboardData.notifications.length === 0 ? (
                <div className="empty-notifications">
                  <i className="far fa-bell-slash"></i>
                  <p>No new notifications</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {dashboardData.notifications.map(notification => (
                    <div key={notification._id || `notification-${Math.random()}`} className="notification-item">
                      <div className={`notification-icon ${notification.priority || 'medium'}`}>
                        {notification.type === 'test_result' && <i className="fas fa-vial"></i>}
                        {notification.type === 'prediction' && <i className="fas fa-chart-line"></i>}
                        {notification.type === 'appointment' && <i className="fas fa-calendar-check"></i>}
                        {notification.type === 'system' && <i className="fas fa-info-circle"></i>}
                        {notification.type === 'message' && <i className="fas fa-envelope"></i>}
                        {(!notification.type || !['test_result', 'prediction', 'appointment', 'system', 'message'].includes(notification.type)) && <i className="fas fa-bell"></i>}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title || 'Notification'}</div>
                        <div className="notification-message">{notification.message || 'You have a new notification'}</div>
                        <div className="notification-time">
                          {notification.createdAt ? formatDate(notification.createdAt) : 'Recent'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="card quick-actions-card">
            <div className="card-header">
              <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="actions-grid">
                <Link to="/patient/appointments/schedule" className="action-item">
                  <div className="action-icon">
                    <i className="fas fa-calendar-plus"></i>
                  </div>
                  <div className="action-text">Schedule Appointment</div>
                </Link>
                
                <Link to="/patient/messages/new" className="action-item">
                  <div className="action-icon">
                    <i className="fas fa-comment-medical"></i>
                  </div>
                  <div className="action-text">Message Doctor</div>
                </Link>
                
                <Link to="/patient/prescriptions" className="action-item">
                  <div className="action-icon">
                    <i className="fas fa-prescription"></i>
                  </div>
                  <div className="action-text">View Prescriptions</div>
                </Link>
                
                <Link to="/patient/health-records" className="action-item">
                  <div className="action-icon">
                    <i className="fas fa-file-medical"></i>
                  </div>
                  <div className="action-text">Health Records</div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Tests */}
          <div className="card recent-tests-card">
            <div className="card-header">
              <h3><i className="fas fa-vial"></i> Recent Tests</h3>
              <Link to="/patient/tests" className="btn btn-text">
                View All
              </Link>
            </div>
            <div className="card-body">
              {!dashboardData.recentTests || dashboardData.recentTests.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-microscope"></i>
                  <p>No recent tests</p>
                </div>
              ) : (
                <ul className="tests-list">
                  {dashboardData.recentTests.map(test => (
                    <li key={test._id || `test-${Math.random()}`} className="test-item">
                      <span className={`test-status status-${test.status || 'unknown'}`}></span>
                      <div className="test-info">
                        <h4>{test.name || 'Medical Test'}</h4>
                        <p><small>{test.date ? formatDate(test.date) : 'Date not available'}</small></p>
                      </div>
                      <Link to={`/tests/${test._id}`} className="btn btn-sm btn-outline">View</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Health Tips */}
          <div className="card health-tips-card">
            <div className="card-header">
              <h3><i className="fas fa-lightbulb"></i> Health Tips</h3>
            </div>
            <div className="card-body">
              <div className="health-tip">
                <div className="tip-icon">
                  <i className="fas fa-apple-alt"></i>
                </div>
                <div className="tip-content">
                  <h4>Healthy Eating</h4>
                  <p>Include more colorful vegetables in your diet for essential nutrients and antioxidants.</p>
                </div>
              </div>
              
              <div className="health-tip">
                <div className="tip-icon">
                  <i className="fas fa-walking"></i>
                </div>
                <div className="tip-content">
                  <h4>Stay Active</h4>
                  <p>Try to get at least 30 minutes of moderate activity each day for heart health.</p>
                </div>
              </div>
              
              <Link to="/health-resources" className="btn btn-text btn-sm">
                More Health Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
