import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/api/v1/doctor/patients');
        setPatients(response.data);
      } catch (error) {
        console.log('Using mock patient data');
        // Mock data for presentation
        setPatients([
          {
            id: 'pat123',
            name: 'John Doe',
            age: 45,
            gender: 'Male',
            email: 'john.doe@example.com',
            phone: '+250 789123456',
            lastVisit: '2023-07-01T10:30:00',
            medicalHistory: ['Hypertension', 'Diabetes'],
            riskLevel: 'moderate'
          },
          {
            id: 'pat456',
            name: 'Jane Smith',
            age: 38,
            gender: 'Female',
            email: 'jane.smith@example.com',
            phone: '+250 789456123',
            lastVisit: '2023-06-15T14:00:00',
            medicalHistory: ['Asthma'],
            riskLevel: 'low'
          },
          {
            id: 'pat789',
            name: 'Michael Johnson',
            age: 62,
            gender: 'Male',
            email: 'michael.j@example.com',
            phone: '+250 789789123',
            lastVisit: '2023-05-20T09:00:00',
            medicalHistory: ['Heart Disease', 'Arthritis'],
            riskLevel: 'high'
          },
          {
            id: 'pat321',
            name: 'Alice Brown',
            age: 29,
            gender: 'Female',
            email: 'alice.b@example.com',
            phone: '+250 789321654',
            lastVisit: '2023-06-28T16:30:00',
            medicalHistory: [],
            riskLevel: 'high'
          },
          {
            id: 'pat654',
            name: 'Robert Wilson',
            age: 51,
            gender: 'Male',
            email: 'robert.w@example.com',
            phone: '+250 789654987',
            lastVisit: '2023-06-10T11:15:00',
            medicalHistory: ['Chronic Bronchitis'],
            riskLevel: 'moderate'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };
  
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading patients...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">Patients</h2>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup className="mb-3 mb-md-0">
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search patients by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-md-end">
              <span className="text-muted me-3">
                {filteredPatients.length} patient(s) found
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {filteredPatients.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="fas fa-users text-muted fa-4x mb-3"></i>
            <h5>No patients found</h5>
            <p className="text-muted">
              No patients match your search criteria
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact Info</th>
                <th>Medical History</th>
                <th>Last Visit</th>
                <th>Risk Level</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className={`avatar-circle bg-${getRiskBadgeClass(patient.riskLevel)} text-white me-3`}>
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold">{patient.name}</div>
                        <small className="text-muted">{patient.gender}, {patient.age} years</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div><i className="fas fa-envelope me-2 text-muted"></i>{patient.email}</div>
                    <div><i className="fas fa-phone me-2 text-muted"></i>{patient.phone}</div>
                  </td>
                  <td>
                    {patient.medicalHistory.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {patient.medicalHistory.map((condition, index) => (
                          <li key={index}><i className="fas fa-check-circle me-2 text-success"></i>{condition}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted">No significant history</span>
                    )}
                  </td>
                  <td>
                    {patient.lastVisit ? (
                      new Date(patient.lastVisit).toLocaleDateString()
                    ) : (
                      <span className="text-muted">No visits</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge bg-${getRiskBadgeClass(patient.riskLevel)}`}>
                      {patient.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-center">
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                    >
                      <i className="fas fa-eye me-1"></i> View
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => navigate(`/doctor/appointments/schedule/${patient.id}`)}
                    >
                      <i className="fas fa-calendar-plus me-1"></i> Schedule
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      
      <style jsx="true">{`
        .avatar-circle {
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

export default PatientsList;
