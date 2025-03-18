import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Table, Form, Badge, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get(`/api/v1/doctor/appointments?filter=${filter}`);
        setAppointments(response.data);
      } catch (error) {
        console.log('Using mock appointment data');
        // Mock data for presentation
        const mockData = [
          { 
            id: 'appt1',
            patientName: 'John Doe',
            patientId: 'pat123',
            date: '2023-07-15T10:30:00',
            endTime: '2023-07-15T11:00:00',
            status: 'confirmed',
            reason: 'Follow-up after treatment',
            notes: 'Patient reported improvement in symptoms',
          },
          {
            id: 'appt2', 
            patientName: 'Jane Smith', 
            patientId: 'pat456',
            date: '2023-07-15T14:00:00',
            endTime: '2023-07-15T14:30:00',
            status: 'pending',
            reason: 'Initial consultation',
            notes: '',
          },
          {
            id: 'appt3', 
            patientName: 'Michael Johnson', 
            patientId: 'pat789',
            date: '2023-07-16T09:15:00',
            endTime: '2023-07-16T10:00:00',
            status: 'confirmed',
            reason: 'Lab results review',
            notes: 'Need to discuss treatment options',
          },
          {
            id: 'appt4', 
            patientName: 'Emily Davis', 
            patientId: 'pat321',
            date: '2023-07-05T11:00:00',
            endTime: '2023-07-05T11:30:00',
            status: 'completed',
            reason: 'Post-surgery check-up',
            notes: 'Recovery proceeding well',
          },
          {
            id: 'appt5', 
            patientName: 'David Wilson', 
            patientId: 'pat654',
            date: '2023-07-06T15:30:00',
            endTime: '2023-07-06T16:00:00',
            status: 'cancelled',
            reason: 'Screening',
            notes: 'Patient cancelled due to travel',
          }
        ];
        
        // Filter based on selected filter
        let filteredData;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filter === 'upcoming') {
          filteredData = mockData.filter(appt => 
            (new Date(appt.date) >= today) && 
            (appt.status === 'confirmed' || appt.status === 'pending')
          );
        } else if (filter === 'past') {
          filteredData = mockData.filter(appt => 
            (new Date(appt.date) < today) || 
            (appt.status === 'completed' || appt.status === 'cancelled')
          );
        } else if (filter === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          filteredData = mockData.filter(appt => {
            const apptDate = new Date(appt.date);
            return apptDate >= today && apptDate < tomorrow;
          });
        } else {
          filteredData = mockData;
        }
        
        setAppointments(filteredData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [filter]);
  
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      // In real app, call API to update status
      // await api.put(`/api/v1/doctor/appointments/${appointmentId}/status`, { status: newStatus });
      
      // Update local state (for demo)
      setAppointments(appointments.map(appt => 
        appt.id === appointmentId ? {...appt, status: newStatus} : appt
      ));
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status');
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge bg="success">Confirmed</Badge>;
      case 'pending': return <Badge bg="warning">Pending</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      case 'completed': return <Badge bg="info">Completed</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading appointments...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">Appointments Management</h2>
      
      <Card className="mb-4">
        <Card.Header className="bg-white">
          <Nav
            variant="tabs"
            activeKey={filter}
            onSelect={(selectedKey) => setFilter(selectedKey)}
            className="border-bottom-0"
          >
            <Nav.Item>
              <Nav.Link eventKey="upcoming">Upcoming</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="today">Today</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="past">Past</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="all">All</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col md={6} lg={4}>
              <Form.Control
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={6} lg={4} className="ms-auto text-md-end mt-3 mt-md-0">
              <span className="text-muted">
                {filteredAppointments.length} appointment(s) found
              </span>
            </Col>
          </Row>
          
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-calendar-times text-muted fa-4x mb-3"></i>
              <h5>No appointments found</h5>
              <p className="text-muted">
                No {filter !== 'all' ? filter : ''} appointments {searchTerm ? 'matching your search criteria' : ''}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle bg-success text-white me-2">
                            {appointment.patientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>{appointment.patientName}</div>
                            <small className="text-muted">ID: {appointment.patientId}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {format(new Date(appointment.date), 'MMM dd, yyyy')}
                        <div className="small text-muted">
                          {format(new Date(appointment.date), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                        </div>
                      </td>
                      <td>
                        <div>{appointment.reason}</div>
                        {appointment.notes && (
                          <small className="text-muted">{appointment.notes}</small>
                        )}
                      </td>
                      <td>
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="text-center">
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        
                        <Dropdown as="span">
                          <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${appointment.id}`}>
                            <i className="fas fa-ellipsis-h"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => navigate(`/doctor/patients/${appointment.patientId}`)}>
                              <i className="fas fa-user me-2"></i> View Patient
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                              disabled={appointment.status === 'confirmed' || appointment.status === 'completed'}
                            >
                              <i className="fas fa-check-circle me-2 text-success"></i> Confirm
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                              disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                            >
                              <i className="fas fa-check-double me-2 text-info"></i> Mark as Completed
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                              disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
                            >
                              <i className="fas fa-times-circle me-2 text-danger"></i> Cancel
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <style jsx="true">{`
        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Container>
  );
};

export default DoctorAppointments;
