import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer by providing the moment object
const localizer = momentLocalizer(moment);

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/appointments/doctor');
        
        // Format appointments for calendar
        const formattedAppointments = (res.data.data || []).map(appt => ({
          id: appt._id,
          title: `${appt.reason || 'Appointment'} - ${appt.patient?.name || 'Patient'}`,
          start: new Date(appt.date),
          end: new Date(new Date(appt.date).getTime() + (appt.duration || 30) * 60000),
          status: appt.status,
          patient: appt.patient,
          reason: appt.reason,
          type: appt.type,
          originalAppointment: appt
        }));
        
        setAppointments(formattedAppointments);
        setLoading(false);
      } catch (err) {
        setError('Failed to load appointments');
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`/api/v1/appointments/${appointmentId}/status`, { status });
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId ? { ...appt, status } : appt
        )
      );
      
      setConfirmAction(null);
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  // Handle confirm action
  const handleConfirmAction = () => {
    if (!confirmAction || !confirmAction.id || !confirmAction.action) {
      console.error('Invalid confirmation action data');
      return;
    }
    
    const status = 
      confirmAction.action === 'confirm' ? 'confirmed' : 
      confirmAction.action === 'complete' ? 'completed' : 'cancelled';
    
    updateAppointmentStatus(confirmAction.id, status);
  };

  return (
    <div className="appointment-calendar-container">
      {loading && <div className="loading">Loading appointments...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Calendar view of appointments */}
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={(event) => {
            let backgroundColor = '#3174ad';
            if (event.status === 'cancelled') backgroundColor = '#dc3545';
            if (event.status === 'completed') backgroundColor = '#28a745';
            if (event.status === 'confirmed') backgroundColor = '#17a2b8';
            return { style: { backgroundColor } };
          }}
        />
      </div>

      {/* Appointment List */}
      <div className="appointments-list">
        <h3>Upcoming Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments scheduled</p>
        ) : (
          appointments.map(appointment => (
            <div key={appointment.id} className={`appointment-item status-${appointment.status}`}>
              <div className="appointment-time">
                {moment(appointment.start).format('MMM D, YYYY h:mm A')}
              </div>
              <div className="appointment-details">
                <h4>{appointment.title}</h4>
                <p>{appointment.reason}</p>
                <span className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="appointment-actions">
                {appointment.status === 'scheduled' && (
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={() => setConfirmAction({ id: appointment.id, action: 'confirm' })}
                  >
                    Confirm
                  </button>
                )}
                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                  <>
                    <button 
                      className="btn btn-sm btn-success" 
                      onClick={() => setConfirmAction({ id: appointment.id, action: 'complete' })}
                    >
                      Complete
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => setConfirmAction({ id: appointment.id, action: 'cancel' })}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="confirmation-dialog">
          <div className="dialog-content">
            <h4>Confirm Action</h4>
            <p>
              Are you sure you want to {
                confirmAction.action === 'confirm' ? 'confirm' :
                confirmAction.action === 'complete' ? 'mark as completed' :
                'cancel'
              } this appointment?
            </p>
            <div className="dialog-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setConfirmAction(null)}
              >
                No, Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmAction}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
