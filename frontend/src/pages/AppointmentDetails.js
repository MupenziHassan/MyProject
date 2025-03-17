import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { authHeader } from '../services/authService';
import '../styles/AppointmentDetails.css';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/appointments/${appointmentId}`, {
          headers: authHeader()
        });
        
        if (response.data.success) {
          setAppointment(response.data.data);
        } else {
          setError('Failed to load appointment details');
        }
      } catch (err) {
        setError('Could not fetch appointment details. Please try again later.');
        console.error('Error fetching appointment:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const handleCancelAppointment = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      setLoading(true);
      const response = await axios.put(
        `/api/v1/appointments/${appointmentId}/status`, 
        { status: 'cancelled' },
        { headers: authHeader() }
      );
      
      if (response.data.success) {
        navigate('/patient/appointments', { 
          state: { 
            success: true, 
            message: 'Appointment cancelled successfully' 
          }
        });
      } else {
        setError('Failed to cancel appointment');
        setLoading(false);
      }
    } catch (err) {
      setError('Could not cancel appointment. Please try again later.');
      console.error('Error cancelling appointment:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading appointment details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <Link to="/patient/appointments" className="btn btn-primary">
          Back to Appointments
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="not-found-container">
        <div className="not-found-message">Appointment not found</div>
        <Link to="/patient/appointments" className="btn btn-primary">
          Back to Appointments
        </Link>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date() && 
    appointment.status !== 'cancelled' && 
    appointment.status !== 'completed';

  return (
    <div className="appointment-details-container">
      <div className="details-header">
        <h1>Appointment Details</h1>
        <div className="status-badge-lg status-badge-lg-{appointment.status}">
          {appointment.status}
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <h2>Appointment Information</h2>
          <div className="detail-row">
            <div className="detail-label">Date</div>
            <div className="detail-value">
              {appointmentDate.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Time</div>
            <div className="detail-value">
              {appointmentDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Doctor</div>
            <div className="detail-value">
              {appointment.doctor?.name || 'Not assigned'}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Type</div>
            <div className="detail-value appointment-type">
              {appointment.type === 'in-person' ? 'In-Person Visit' : 
               appointment.type === 'video' ? 'Video Consultation' : 'Phone Call'}
            </div>
          </div>

          {appointment.location && (
            <div className="detail-row">
              <div className="detail-label">Location</div>
              <div className="detail-value">{appointment.location}</div>
            </div>
          )}

          <div className="detail-row">
            <div className="detail-label">Reason for Visit</div>
            <div className="detail-value">{appointment.reason}</div>
          </div>
        </div>

        {appointment.notes && (
          <div className="details-card">
            <h2>Doctor's Notes</h2>
            <div className="doctor-notes">
              {appointment.notes}
            </div>
          </div>
        )}

        <div className="details-actions">
          <Link to="/patient/appointments" className="btn btn-secondary">
            Back to Appointments
          </Link>
          
          {isUpcoming && (
            <button 
              className="btn btn-danger"
              onClick={handleCancelAppointment}
              disabled={loading}
            >
              Cancel Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
