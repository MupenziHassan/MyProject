import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, isPast, isToday, parseISO } from 'date-fns';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/appointments/patient');
      setAppointments(res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load appointments');
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      await axios.put(`/api/v1/appointments/${appointmentId}/status`, { status: 'cancelled' });
      fetchAppointments(); // Refresh list
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(appointment.date);
    
    if (activeTab === 'upcoming') {
      return !isPast(appointmentDate) || isToday(appointmentDate);
    } else if (activeTab === 'past') {
      return isPast(appointmentDate) && !isToday(appointmentDate);
    } else if (activeTab === 'cancelled') {
      return appointment.status === 'cancelled';
    }
    return true;
  });

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="appointments-list-container">
      <div className="appointments-header">
        <h2>My Appointments</h2>
        <Link to="/patient/appointments/book" className="btn btn-primary">
          <i className="fas fa-plus"></i> New Appointment
        </Link>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <i className="far fa-calendar"></i>
          <p>No {activeTab} appointments found</p>
          {activeTab === 'upcoming' && (
            <Link to="/patient/appointments/book" className="btn btn-outline-primary">
              Book an Appointment
            </Link>
          )}
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map(appointment => {
            const appointmentDate = parseISO(appointment.date);
            const isUpcoming = !isPast(appointmentDate) || isToday(appointmentDate);
            
            return (
              <div key={appointment._id} className="appointment-card">
                <div className={`status-indicator ${appointment.status}`}></div>
                
                <div className="appointment-date">
                  <div className="date-day">{format(appointmentDate, 'd')}</div>
                  <div className="date-month">{format(appointmentDate, 'MMM')}</div>
                  <div className="date-year">{format(appointmentDate, 'yyyy')}</div>
                </div>
                
                <div className="appointment-details">
                  <div className="appointment-time">
                    <i className="far fa-clock"></i> {format(appointmentDate, 'h:mm a')}
                  </div>
                  
                  <h4 className="doctor-name">
                    <i className="fas fa-user-md"></i> Dr. {appointment.doctor?.name || 'Unknown'}
                  </h4>
                  
                  <div className="appointment-type">
                    <span className={`type-badge ${appointment.type}`}>
                      {appointment.type === 'in-person' ? 'In-Person' : 
                       appointment.type === 'video' ? 'Video Call' : 'Phone Call'}
                    </span>
                  </div>
                  
                  {appointment.location && (
                    <div className="appointment-location">
                      <i className="fas fa-map-marker-alt"></i> {appointment.location}
                    </div>
                  )}
                  
                  <div className="appointment-reason">
                    <strong>Reason:</strong> {appointment.reason}
                  </div>
                </div>
                
                <div className="appointment-actions">
                  {isUpcoming && appointment.status !== 'cancelled' && (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCancelAppointment(appointment._id)}
                    >
                      Cancel
                    </button>
                  )}
                  
                  {appointment.type === 'video' && isUpcoming && appointment.status !== 'cancelled' && (
                    <a 
                      href={appointment.meetingLink || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                      disabled={!appointment.meetingLink}
                    >
                      Join Call
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
