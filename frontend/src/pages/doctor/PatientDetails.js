import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab, Badge, ListGroup, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Simulate loading data in a controlled way
  React.useEffect(() => {
    const loadPatientData = async () => {
      try {
        const response = await api.get(`/api/v1/doctor/patients/${patientId}`);
        setPatient(response.data);
      } catch (error) {
        console.log('Using mock patient data', error);
        // Mock data for presentation
        setPatient({
          id: patientId,
          name: 'John Doe',
          age: 45,
          // ... rest of mock patient data
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientId]);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading patient details...</p>
      </Container>
    );
  }
  
  if (!patient) {
    return (
      <Container className="py-4 text-center">
        <div className="alert alert-danger">
          Patient not found or error loading patient data
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/doctor/patients')}
        >
          Back to Patients List
        </Button>
      </Container>
    );
  }
  
  const getBMI = () => {
    if (!patient.height || !patient.weight) return 'N/A';
    const heightInMeters = patient.height / 100;
    const bmi = (patient.weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
  };
  
  const getRiskBadgeVariant = (risk) => {
    switch (risk) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };
  
  return (
    <Container className="py-4">
      <Row>
        <Col lg={4} xl={3}>
          <Card className="mb-4">
            <Card.Header>Patient Information</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Name:</span>
                <span className="fw-bold">{patient.name}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Age:</span>
                <span className="fw-bold">{patient.age}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Gender:</span>
                <span className="fw-bold">{patient.gender}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Height:</span>
                <span className="fw-bold">{patient.height ? `${patient.height} cm` : 'Unknown'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Weight:</span>
                <span className="fw-bold">{patient.weight ? `${patient.weight} kg` : 'Unknown'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>BMI:</span>
                <span className="fw-bold">{getBMI()}</span>
              </div>
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Header>Contact Information</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <i className="fas fa-envelope me-2 text-primary"></i>
                {patient.email}
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="fas fa-phone me-2 text-primary"></i>
                {patient.phone}
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                {patient.address}
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="fas fa-exclamation-circle me-2 text-danger"></i>
                <strong>Emergency Contact:</strong><br />
                {patient.emergencyContact}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col lg={8} xl={9}>
          <Tab.Container defaultActiveKey="overview">
            <Card>
              <Card.Header className="bg-white">
                <Nav variant="tabs" className="border-bottom-0">
                  <Nav.Item>
                    <Nav.Link eventKey="overview">Overview</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="assessments">Risk Assessments</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="appointments">Appointments</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="documents">Documents</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="overview">
                    <Row>
                      <Col md={6}>
                        <Card className="mb-4">
                          <Card.Header>Medical History</Card.Header>
                          <Card.Body>
                            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                              <ListGroup variant="flush">
                                {patient.medicalHistory.map((condition, index) => (
                                  <ListGroup.Item key={index}>
                                    <i className="fas fa-check-circle me-2 text-success"></i>
                                    {condition}
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            ) : (
                              <p className="text-muted">No medical history recorded</p>
                            )}
                          </Card.Body>
                        </Card>
                        <Card className="mb-4">
                          <Card.Header>Allergies</Card.Header>
                          <Card.Body>
                            {patient.allergies && patient.allergies.length > 0 ? (
                              <ListGroup variant="flush">
                                {patient.allergies.map((allergy, index) => (
                                  <ListGroup.Item key={index}>
                                    <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
                                    {allergy}
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            ) : (
                              <p className="text-muted">No allergies recorded</p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-4">
                          <Card.Header>Current Medications</Card.Header>
                          <Card.Body>
                            {patient.medications && patient.medications.length > 0 ? (
                              <ListGroup variant="flush">
                                {patient.medications.map((medication, index) => (
                                  <ListGroup.Item key={index}>
                                    <div className="fw-bold">{medication.name}</div>
                                    <div className="text-muted">
                                      {medication.dosage}, {medication.frequency}
                                    </div>
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            ) : (
                              <p className="text-muted">No current medications</p>
                            )}
                          </Card.Body>
                        </Card>
                        <Card>
                          <Card.Header>Doctor's Notes</Card.Header>
                          <Card.Body>
                            <p>{patient.notes || 'No notes recorded'}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>
                  <Tab.Pane eventKey="assessments">
                    <h5 className="mb-3">Cancer Risk Assessments</h5>
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Risk Score</th>
                          <th>Risk Level</th>
                          <th>Recommendation</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patient.riskAssessments && patient.riskAssessments.length > 0 ? (
                          patient.riskAssessments.map(assessment => (
                            <tr key={assessment.id}>
                              <td>{new Date(assessment.date).toLocaleDateString()}</td>
                              <td>{assessment.type}</td>
                              <td>{assessment.score}/10</td>
                              <td>
                                <Badge bg={getRiskBadgeVariant(assessment.level)}>
                                  {assessment.level.toUpperCase()}
                                </Badge>
                              </td>
                              <td>{assessment.recommendation}</td>
                              <td className="text-center">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => navigate(`/doctor/assessments/${assessment.id}`)}
                                >
                                  <i className="fas fa-eye"></i> View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center">No risk assessments recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    <div className="text-center mt-3">
                      <Button 
                        variant="success"
                        onClick={() => navigate(`/doctor/assessments/new/${patientId}`)}
                      >
                        <i className="fas fa-plus-circle me-2"></i>
                        New Risk Assessment
                      </Button>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="appointments">
                    <h5 className="mb-3">Appointment History</h5>
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Reason</th>
                          <th>Doctor</th>
                          <th>Status</th>
                          <th>Notes</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patient.appointments && patient.appointments.length > 0 ? (
                          patient.appointments.map(appointment => (
                            <tr key={appointment.id}>
                              <td>{new Date(appointment.date).toLocaleDateString()}</td>
                              <td>{appointment.reason}</td>
                              <td>{appointment.doctor}</td>
                              <td>
                                <Badge bg={
                                  appointment.status === 'completed' ? 'success' :
                                  appointment.status === 'upcoming' ? 'primary' :
                                  appointment.status === 'cancelled' ? 'danger' : 'secondary'
                                }>
                                  {appointment.status}
                                </Badge>
                              </td>
                              <td>{appointment.notes || 'No notes'}</td>
                              <td className="text-center">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                                >
                                  <i className="fas fa-eye"></i> View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center">No appointments recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    <div className="text-center mt-3">
                      <Button 
                        variant="primary"
                        onClick={() => navigate(`/doctor/appointments/schedule/${patientId}`)}
                      >
                        <i className="fas fa-calendar-plus me-2"></i>
                        Schedule New Appointment
                      </Button>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="documents">
                    <h5 className="mb-3">Medical Documents</h5>
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Name</th>
                          <th>Type</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patient.documents && patient.documents.length > 0 ? (
                          patient.documents.map(document => (
                            <tr key={document.id}>
                              <td>{new Date(document.date).toLocaleDateString()}</td>
                              <td>{document.name}</td>
                              <td>
                                <Badge bg={
                                  document.type === 'lab' ? 'info' :
                                  document.type === 'imaging' ? 'primary' :
                                  document.type === 'certificate' ? 'success' : 'secondary'
                                }>
                                  {document.type}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  className="me-2"
                                >
                                  <i className="fas fa-eye"></i> View
                                </Button>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                >
                                  <i className="fas fa-download"></i> Download
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">No documents available</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    <div className="text-center mt-3">
                      <Button variant="primary">
                        <i className="fas fa-file-upload me-2"></i>
                        Upload Document
                      </Button>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientDetails;
