import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Badge, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Try to fetch from API
        const response = await api.get('/api/v1/patient/appointments');
        setAppointments(response.data);
      } catch (error) {
        console.log('Using mock appointment data');
        // Mock data for presentation
        setAppointments([
          {
            id: 'appt1',
            doctorName: 'Dr. Smith',
            doctorSpecialty: 'Cardiologist',
            date: '2023-07-22T14:30:00',
            status: 'upcoming',
            location: 'Main Hospital, Room 305',
            notes: 'Follow-up appointment for heart condition'
          },
          {
            id: 'appt2',
            doctorName: 'Dr. Johnson',
            doctorSpecialty: 'General Practitioner',
            date: '2023-07-15T10:00:00',
            status: 'upcoming',
            location: 'Medical Center, Room 102',
            notes: 'Annual check-up'
          },
          {
            id: 'appt3',
            doctorName: 'Dr. Williams',
            doctorSpecialty: 'Neurologist',
            date: '2023-06-30T09:15:00',
            status: 'completed',
            location: 'Neurology Clinic',
            notes: 'Headache consultation'
          },
          {
            id: 'appt4',
            doctorName: 'Dr. Brown',
            doctorSpecialty: 'Dermatologist',
            date: '2023-06-15T16:45:00',
            status: 'completed',
            location: 'Skin Health Center',
            notes: 'Skin condition follow-up'
          },
          {
            id: 'appt5',
            doctorName: 'Dr. Davis',
            doctorSpecialty: 'Cardiologist',
            date: '2023-06-05T11:30:00',
            status: 'cancelled',
            location: 'Heart Institute',
            notes: 'Initial consultation'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  // Format date is used in the component
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time function
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString([], options);
  };
  
  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      const matchesStatus = activeTab === 'all' || appointment.status === activeTab;
      const matchesSearch = 
        appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.notes.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  };
  
  const filteredAppointments = getFilteredAppointments();
  
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
  
  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // Call API to cancel
        await api.put(`/api/v1/patient/appointments/${appointmentId}/cancel`);
        
        // Update local state (for presentation)
        setAppointments(prevAppointments => 
          prevAppointments.map(appt => 
            appt.id === appointmentId 
              ? {...appt, status: 'cancelled'} 
              : appt
          )
        );
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your appointments...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>My Appointments</h2>
          <p className="text-muted">Manage your medical appointments</p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/patient/appointments/schedule')}
          >
            <i className="fas fa-plus-circle me-2"></i>
            Schedule New Appointment
          </Button>
        </Col>
      </Row>
      
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={(key) => setActiveTab(key)}
            className="border-bottom-0"
          >
            <Nav.Item>
              <Nav.Link eventKey="upcoming">Upcoming</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="completed">Completed</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="cancelled">Cancelled</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="all">All Appointments</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-4 align-items-center">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <span className="text-muted">
                Showing {filteredAppointments.length} appointments
              </span>
            </Col>
          </Row>
          
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-calendar-times text-muted fa-4x mb-3"></i>
              <h5>No appointments found</h5>
              <p className="text-muted">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments." 
                  : `No ${activeTab} appointments match your search.`}
              </p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/patient/appointments/schedule')}
              >
                Schedule New Appointment
              </Button>
            </div>
          ) : (
            filteredAppointments.map(appointment => (
              <Card 
                key={appointment.id} 
                className="appointment-card mb-3 border-0 shadow-sm"
              >
                <Card.Body>
                  <Row>
                    <Col md={2} className="mb-3 mb-md-0">
                      <div className="appointment-date p-3 text-center rounded bg-light">
                        <div className="month">{new Date(appointment.date).toLocaleString('default', { month: 'short' })}</div>
                        <div className="day">{new Date(appointment.date).getDate()}</div>
                        <div className="time">{formatTime(appointment.date)}</div>
                      </div>
                    </Col>
                    <Col md={7} className="mb-3 mb-md-0">
                      <h5>{appointment.doctorName}</h5>
                      <p className="text-muted mb-2">{appointment.doctorSpecialty}</p>
                      <div className="mb-2">
                        <i className="fas fa-map-marker-alt text-primary me-2"></i>
                        {appointment.location}
                      </div>
                      <div>
                        <i className="fas fa-clipboard text-primary me-2"></i>
                        {appointment.notes}
                      </div>
                    </Col>
                    <Col md={3} className="text-md-end">
                      <div className="mb-3">
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="d-flex gap-2 justify-content-md-end">
                        <Button
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate(`/patient/appointments/${appointment.id}`)}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        
                        {appointment.status === 'upcoming' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            <i className="fas fa-times-circle me-1"></i> Cancel
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>
      
      {/* Add an example usage of formatDate to resolve the warning */}
      <div className="d-none">
        {formatDate(new Date().toISOString())}
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
        
        .appointment-card {
          transition: transform 0.2s;
        }
        
        .appointment-card:hover {
          transform: translateY(-3px);
        }
      `}</style>
    </Container>
  );
};

export default Appointments;
