import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Badge, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        // Try to fetch from API
        const response = await api.get(`/api/v1/patient/appointments/${appointmentId}`);
        setAppointment(response.data);
      } catch (error) {
        console.log('Using mock appointment data');
        // Mock data for presentation
        setAppointment({
          id: appointmentId,
          doctorName: 'Dr. Smith',
          doctorSpecialty: 'Cardiologist',
          date: '2023-07-22T14:30:00',
          status: 'upcoming',
          location: 'Main Hospital, Room 305',
          notes: 'Follow-up appointment for heart condition',
          doctorProfilePic: 'https://randomuser.me/api/portraits/men/72.jpg',
          duration: 30,
          reason: 'Follow-up consultation'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString([], options);
  };

  const getStatusBadge = (status) => {
    let variant;
    let label;
    
    switch(status) {
      case 'upcoming':
        variant = 'primary';
        label = 'Upcoming';
        break;
      case 'completed':
        variant = 'success';
        label = 'Completed';
        break;
      case 'cancelled':
        variant = 'danger';
        label = 'Cancelled';
        break;
      default:
        variant = 'secondary';
        label = status;
    }
    
    return <Badge bg={variant}>{label}</Badge>;
  };

  const handleCancelAppointment = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // Call API to cancel
        await api.put(`/api/v1/patient/appointments/${appointmentId}/cancel`);
        
        // Update local state
        setAppointment({...appointment, status: 'cancelled'});
        
      } catch (error) {
        setError('Failed to cancel appointment. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading appointment details...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          className="me-3"
          onClick={() => navigate('/patient/appointments')}
        >
          <i className="fas fa-arrow-left"></i>
        </Button>
        <div>
          <h2 className="mb-0">Appointment Details</h2>
          <p className="text-muted mb-0">View your appointment information</p>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={2} className="text-center mb-4 mb-md-0">
              <div className="appointment-date p-3 rounded bg-light mb-3">
                <div className="month">{new Date(appointment.date).toLocaleString('default', { month: 'short' })}</div>
                <div className="day">{new Date(appointment.date).getDate()}</div>
                <div className="time">{formatTime(appointment.date)}</div>
              </div>
              <div>
                {getStatusBadge(appointment.status)}
              </div>
            </Col>
            
            <Col md={10}>
              <div className="d-md-flex justify-content-between mb-4">
                <div>
                  <h4>{appointment.doctorName}</h4>
                  <p className="text-muted">{appointment.doctorSpecialty}</p>
                </div>
                
                <div>
                  {appointment.status === 'upcoming' && (
                    <Button 
                      variant="outline-danger"
                      onClick={handleCancelAppointment}
                    >
                      <i className="fas fa-times-circle me-2"></i>
                      Cancel Appointment
                    </Button>
                  )}
                </div>
              </div>
              
              <hr />
              
              <Row className="mt-4">
                <Col md={6} className="mb-4">
                  <h5 className="mb-3">Appointment Information</h5>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Date</div>
                    <div className="d-flex align-items-center">
                      <i className="far fa-calendar me-2 text-primary"></i>
                      <strong>{formatDate(appointment.date)}</strong>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Time</div>
                    <div className="d-flex align-items-center">
                      <i className="far fa-clock me-2 text-primary"></i>
                      <strong>{formatTime(appointment.date)}</strong>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Duration</div>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-hourglass-half me-2 text-primary"></i>
                      <strong>{appointment.duration} minutes</strong>
                    </div>
                  </div>
                </Col>
                
                <Col md={6} className="mb-4">
                  <h5 className="mb-3">Location Details</h5>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Address</div>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                      <strong>{appointment.location}</strong>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Reason for Visit</div>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-file-medical-alt me-2 text-primary"></i>
                      <strong>{appointment.reason}</strong>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <hr />
              
              <div className="mt-4">
                <h5 className="mb-3">Notes</h5>
                <p>{appointment.notes || 'No additional notes.'}</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="text-center">
        <Button 
          variant="primary" 
          onClick={() => navigate('/patient/appointments')}
        >
          Back to Appointments
        </Button>
      </div>

      <style jsx="true">{`
        .appointment-date {
          background-color: #f8f9fa;
          border-radius: 0.5rem;
        }
        
        .appointment-date .month {
          font-size: 0.9rem;
          text-transform: uppercase;
          font-weight: bold;
          color: #6c757d;
        }
        
        .appointment-date .day {
          font-size: 1.8rem;
          font-weight: bold;
          line-height: 1.2;
        }
        
        .appointment-date .time {
          font-size: 0.9rem;
          color: #6c757d;
        }
      `}</style>
    </Container>
  );
};

export default AppointmentDetails;
