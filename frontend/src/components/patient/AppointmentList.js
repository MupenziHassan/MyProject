import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AppointmentList.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointmentsData = async () => {
      try {
        setLoading(true);
        let statusParam = '';
        
        switch (activeFilter) {
          case 'upcoming':
            statusParam = 'scheduled,confirmed';
            break;
          case 'past':
            statusParam = 'completed,cancelled,no-show';
            break;
          case 'today':
            // No status filter, will filter by date in the component
            break;
          default:
            break;
        }
        
        const res = await axios.get(`/api/v1/appointments/patient?status=${statusParam}`);
        
        let filteredAppointments = res.data.data;
        
        // Additional filtering for "today"
        if (activeFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          filteredAppointments = filteredAppointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate >= today && appointmentDate < tomorrow;
          });
        }
        
        setAppointments(filteredAppointments);
      } catch (err) {
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsData();
    
    // Only re-run when activeFilter changes
  }, [activeFilter]);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await axios.put(`/api/v1/appointments/${appointmentId}/status`, {
        status: 'cancelled'
      });
      
      // Update the appointment status locally
      setAppointments(appointments.map(app => {
        if (app._id === appointmentId) {
          return { ...app, status: 'cancelled' };
        }
        return app;
      }));
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const doctorName = appointment.doctor?.name || '';
    const appointmentType = appointment.type || '';
    const reason = appointment.reason || '';
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return (
      doctorName.toLowerCase().includes(lowerCaseSearch) ||
      appointmentType.toLowerCase().includes(lowerCaseSearch) ||
      reason.toLowerCase().includes(lowerCaseSearch)
    );
  });

  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (appointment.status === 'cancelled') {
      return { text: 'Cancelled', class: 'cancelled' };
    } else if (appointment.status === 'completed') {
      return { text: 'Completed', class: 'completed' };
    } else if (appointment.status === 'no-show') {
      return { text: 'No-Show', class: 'no-show' };
    } else if (appointmentDate < now) {
      return { text: 'Missed', class: 'no-show' };
    } else if (appointment.status === 'confirmed') {
      return { text: 'Confirmed', class: 'confirmed' };
    } else {
      return { text: 'Scheduled', class: 'scheduled' };
    }
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="appointments-list-container">
      <div className="appointments-header">
        <h2>Your Appointments</h2>
        <Link to="/patient/appointments/schedule" className="btn btn-primary">
          <i className="fas fa-plus"></i> New Appointment
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="appointment-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setActiveFilter('today')}
          >
            Today
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'past' ? 'active' : ''}`}
            onClick={() => setActiveFilter('past')}
          >
            Past
          </button>
        </div>
        
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              &times;
            </button>
          )}
        </div>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <div className="empty-state">
            <i className="fas fa-calendar-times"></i>
            <p>No {activeFilter} appointments found.</p>
            {activeFilter === 'upcoming' && (
              <Link to="/patient/appointments/schedule" className="btn btn-primary">
                Schedule New Appointment
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map(appointment => {
            const status = getAppointmentStatus(appointment);
            const appointmentDate = new Date(appointment.date);
            const isUpcoming = appointmentDate > new Date() && appointment.status !== 'cancelled';
            
            return (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-date">
                  <div className="date-badge">
                    <span className="month">
                      {appointmentDate.toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="day">{appointmentDate.getDate()}</span>
                  </div>
                  <span className="time">
                    {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="appointment-details">
                  <h4 className="doctor-name">Dr. {appointment.doctor?.name || 'Unknown'}</h4>
                  <div className="appointment-type">
                    <span className={`type-badge ${appointment.type}`}>
                      {appointment.type === 'in-person' ? 'In-Person' : 
                       appointment.type === 'video' ? 'Video Call' : 'Phone Call'}
                    </span>
                    {appointment.location && <span className="location">{appointment.location}</span>}
                  </div>
                  <p className="reason">{appointment.reason}</p>
                  <div className="appointment-status">
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </div>
                </div>
                
                <div className="appointment-actions">
                  <Link 
                    to={`/patient/appointments/${appointment._id}`} 
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Details
                  </Link>
                  
                  {isUpcoming && (
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Cancel
                    </button>
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

export default AppointmentList;
