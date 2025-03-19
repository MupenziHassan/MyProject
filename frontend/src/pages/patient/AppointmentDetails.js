import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/api/v1/patient/appointments/${appointmentId}`);
        setAppointment(response.data);
      } catch (error) {
        console.log('Using mock appointment data');
        // Mock data for presentation
        setAppointment({
          id: appointmentId,
          doctorName: 'Dr. Mugisha',
          doctorSpecialty: 'Oncologist',
          date: new Date().toISOString(),
          time: '10:30 AM',
          status: 'confirmed',
          location: 'Ubumuntu Clinic, Room 305',
          notes: 'Follow-up cancer screening appointment',
          reason: 'Cancer screening',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointment();
  }, [appointmentId]);
  
  const handleCancelAppointment = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setLoading(true);
        // Call API to cancel the appointment
        await api.put(`/api/v1/patient/appointments/${appointmentId}/cancel`);
        
        // Update local state
        setAppointment(prev => ({
          ...prev,
          status: 'cancelled'
        }));
        setSuccessMessage('Appointment cancelled successfully');
      } catch (err) {
        setError('Failed to cancel appointment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const getStatusBadge = (status) => {
    let variant;
    switch(status) {
      case 'confirmed':
        variant = 'success';
        break;
      case 'pending':
        variant = 'warning';
        break;
      case 'cancelled':
        variant = 'danger';
        break;
      case 'completed':
        variant = 'info';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge bg={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
  
  if (!appointment) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Appointment not found or could not be loaded
        </Alert>
        <Button 
          variant="primary"
          onClick={() => navigate('/patient/appointments')}
        >
          Back to Appointments
        </Button>
      </Container>
    );
  }
  
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = appointment.time || appointmentDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <Container className="py-4">
      <PageHeader
        title="Appointment Details"
        subtitle="View your appointment information"
        showBackButton={true}
        backPath="/patient/appointments"
      />
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Appointment Information</h5>
          {getStatusBadge(appointment.status)}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="mb-4">
                <h6 className="text-muted mb-2">Date & Time</h6>
                <div className="d-flex align-items-center">
                  <div className="appointment-icon me-3 bg-primary text-white">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div>
                    <div className="fw-bold">{formattedDate}</div>
                    <div>{formattedTime}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">Doctor</h6>
                <div className="d-flex align-items-center">
                  <div className="appointment-icon me-3 bg-success text-white">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <div>
                    <div className="fw-bold">{appointment.doctorName}</div>
                    <div>{appointment.doctorSpecialty}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h6 className="text-muted mb-2">Location</h6>
                <div className="d-flex align-items-center">
                  <div className="appointment-icon me-3 bg-info text-white">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <div className="fw-bold">{appointment.location}</div>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-4">
                <h6 className="text-muted mb-2">Reason for Visit</h6>
                <p>{appointment.reason || 'Not specified'}</p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">Notes</h6>
                <p>{appointment.notes || 'No additional notes'}</p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">Created On</h6>
                <p>{new Date(appointment.createdAt).toLocaleDateString()}</p>
              </div>
            </Col>
          </Row>
          
          <div className="mt-4 text-center">
            {appointment.status === 'confirmed' || appointment.status === 'pending' ? (
              <>
                <Button 
                  variant="danger" 
                  onClick={handleCancelAppointment} 
                  className="me-2"
                  disabled={loading}
                >
                  <i className="fas fa-times-circle me-2"></i>
                  Cancel Appointment
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate(`/patient/appointments/reschedule/${appointmentId}`)}
                >
                  <i className="fas fa-calendar-alt me-2"></i>
                  Reschedule
                </Button>
              </>
            ) : appointment.status === 'cancelled' ? (
              <Button 
                variant="primary" 
                onClick={() => navigate('/patient/appointments/schedule')}
              >
                <i className="fas fa-calendar-plus me-2"></i>
                Schedule New Appointment
              </Button>
            ) : (
              <>
                <p className="text-success mb-3">
                  <i className="fas fa-check-circle me-2"></i>
                  This appointment has been completed
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/patient/appointments/schedule')}
                >
                  <i className="fas fa-calendar-plus me-2"></i>
                  Schedule New Appointment
                </Button>
              </>
            )}
          </div>
        </Card.Body>
      </Card>
      
      <style jsx="true">{`
        .appointment-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Container>
  );
};

export default AppointmentDetails;
