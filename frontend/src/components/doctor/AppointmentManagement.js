import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/appointments/doctor');
        setAppointments(res.data.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load appointments');
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await axios.put(`/api/v1/appointments/${appointmentId}/status`, { status });
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt._id === appointmentId ? { ...appt, status } : appt
        )
      );
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="appointment-management">
      <h3>Appointment Management</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {appointments.length === 0 ? (
        <div className="no-data">No appointments found</div>
      ) : (
        <div className="appointment-list">
          {appointments.slice(0, 5).map(appointment => (
            <div key={appointment._id} className="appointment-item">
              <div className="appointment-info">
                <div className="appointment-date">
                  {new Date(appointment.date).toLocaleDateString()}
                  <span className="appointment-time">
                    {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="patient-info">
                  <strong>{appointment.patient?.name || 'Unknown Patient'}</strong>
                </div>
                <div className="appointment-reason">
                  {appointment.reason}
                </div>
                <div className="appointment-status">
                  Status: <span className={`status-${appointment.status}`}>{appointment.status}</span>
                </div>
              </div>
              <div className="appointment-actions">
                {appointment.status === 'scheduled' && (
                  <>
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                    >
                      Confirm
                    </button>
                  </>
                )}
                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                  <>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleStatusChange(appointment._id, 'completed')}
                    >
                      Complete
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {appointments.length > 5 && (
            <div className="view-all">
              <a href="/doctor/appointments">View all appointments</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
