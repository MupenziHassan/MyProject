import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // New patient modal state
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    dob: '',
    address: '',
    emergencyContact: '',
    relationship: '',
    emergencyPhone: '',
    medicalHistory: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState(null);

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
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle modal open/close
  const handleCloseModal = () => {
    setShowAddPatientModal(false);
    setFormError('');
    setFormSuccess('');
    setCreatedPatientId(null);
  };
  
  const handleShowModal = () => {
    setShowAddPatientModal(true);
    // Reset the form
    setNewPatientForm({
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      dob: '',
      address: '',
      emergencyContact: '',
      relationship: '',
      emergencyPhone: '',
      medicalHistory: ''
    });
    setFormError('');
    setFormSuccess('');
    setSubmitting(false);
    setCreatedPatientId(null);
  };
  
  // Handle form submission to create a new patient
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    
    // Basic form validation
    if (!newPatientForm.name || !newPatientForm.email || !newPatientForm.phone) {
      setFormError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }
    
    try {
      // Convert medical history string to array if provided
      const medicalHistoryArray = newPatientForm.medicalHistory 
        ? newPatientForm.medicalHistory.split(',').map(item => item.trim()) 
        : [];
      
      // Prepare the payload
      const patientData = {
        name: newPatientForm.name,
        email: newPatientForm.email,
        phone: newPatientForm.phone,
        gender: newPatientForm.gender,
        dob: newPatientForm.dob,
        address: newPatientForm.address,
        emergencyContact: newPatientForm.emergencyContact,
        relationship: newPatientForm.relationship,
        emergencyPhone: newPatientForm.emergencyPhone,
        medicalHistory: medicalHistoryArray
      };
      
      // Make API call to create patient
      const response = await api.post('/api/v1/doctors/patients', patientData);
      
      if (response.data && response.data.success) {
        setFormSuccess('Patient created successfully!');
        setCreatedPatientId(response.data.data.patient._id || response.data.data.patient.id);
        
        // Refresh the patients list
        const updatedPatientsList = await api.get('/api/v1/doctor/patients');
        setPatients(updatedPatientsList.data.data || []);
      } else {
        setFormError('Failed to create patient: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Create patient error:', error);
      setFormError('Failed to create patient: ' + (error.response?.data?.error || 'Server error'));
      
      // For demonstration purposes, create a mock successful response
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock patient creation success');
        setFormSuccess('Patient created successfully! (Demo Mode)');
        setCreatedPatientId('mock-patient-id-' + Date.now());
        
        // Add the new patient to the list for demonstration
        const newPatient = {
          id: 'mock-patient-id-' + Date.now(),
          name: newPatientForm.name,
          age: newPatientForm.dob ? Math.floor((new Date() - new Date(newPatientForm.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 30,
          gender: newPatientForm.gender,
          email: newPatientForm.email,
          phone: newPatientForm.phone,
          lastVisit: null,
          medicalHistory: newPatientForm.medicalHistory ? newPatientForm.medicalHistory.split(',').map(item => item.trim()) : [],
          riskLevel: 'low'
        };
        
        setPatients(prev => [newPatient, ...prev]);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Navigate to assessment
  const handleProceedToAssessment = () => {
    if (createdPatientId) {
      navigate(`/doctor/patients/${createdPatientId}/new-assessment`);
    } else {
      setFormError('No patient ID available');
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0">Patients</h2>
        </Col>
        <Col className="text-end">
          <Button 
            variant="success" 
            onClick={handleShowModal}
          >
            <i className="fas fa-user-plus me-2"></i>
            Add New Patient
          </Button>
        </Col>
      </Row>
      
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
              <span className="text-muted">
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
      
      {/* Add New Patient Modal */}
      <Modal show={showAddPatientModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <Alert variant="danger" onClose={() => setFormError('')} dismissible>
              {formError}
            </Alert>
          )}
          
          {formSuccess && (
            <Alert variant="success" onClose={() => setFormSuccess('')} dismissible>
              {formSuccess}
            </Alert>
          )}
          
          <Form onSubmit={handleCreatePatient}>
            <Row>
              <Col md={12}>
                <h5 className="mb-3">Basic Information</h5>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newPatientForm.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={newPatientForm.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={newPatientForm.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={newPatientForm.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={newPatientForm.dob}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={newPatientForm.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                  />
                </Form.Group>
              </Col>
              
              <Col md={12}>
                <hr className="my-3" />
                <h5 className="mb-3">Emergency Contact Information</h5>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyContact"
                    value={newPatientForm.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Emergency contact name"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Relationship</Form.Label>
                  <Form.Control
                    type="text"
                    name="relationship"
                    value={newPatientForm.relationship}
                    onChange={handleInputChange}
                    placeholder="Relationship to patient"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyPhone"
                    value={newPatientForm.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="Emergency contact phone"
                  />
                </Form.Group>
              </Col>
              
              <Col md={12}>
                <hr className="my-3" />
                <h5 className="mb-3">Medical Information</h5>
              </Col>
              
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Medical History</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="medicalHistory"
                    value={newPatientForm.medicalHistory}
                    onChange={handleInputChange}
                    placeholder="Enter existing conditions (comma-separated)"
                  />
                  <Form.Text className="text-muted">
                    Enter pre-existing conditions, separated by commas (e.g. Diabetes, Hypertension, Asthma)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {!formSuccess ? (
            <>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreatePatient} 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : 'Create Patient'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button 
                variant="success" 
                onClick={handleProceedToAssessment}
              >
                <i className="fas fa-clipboard-check me-2"></i>
                Proceed to Risk Assessment
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

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
