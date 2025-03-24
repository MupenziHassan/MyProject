import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import DashboardStats from '../../components/common/DashboardStats';
import PageHeader from '../../components/common/PageHeader';

const DoctorDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
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
    const fetchDashboardData = async () => {
      try {
        // Try to fetch real data
        const response = await api.get('/api/v1/doctors/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.log('Using mock dashboard data');
        // Use mock data for presentation
        setDashboardData({
          todayAppointments: 5,
          pendingAssessments: 3,
          totalPatients: 24,
          upcomingAppointments: [
            { 
              id: 'appt1',
              patientName: 'John Doe',
              date: '2023-07-15T10:30:00',
              status: 'confirmed',
              reason: 'Follow-up after treatment',
              patientId: 'pat123'
            },
            {
              id: 'appt2', 
              patientName: 'Jane Smith', 
              date: '2023-07-15T14:00:00',
              status: 'pending',
              reason: 'Initial consultation', 
              patientId: 'pat456'
            },
            {
              id: 'appt3', 
              patientName: 'Michael Johnson', 
              date: '2023-07-16T09:15:00',
              status: 'confirmed',
              reason: 'Lab results review', 
              patientId: 'pat789'
            }
          ],
          recentAssessments: [
            {
              id: 'assess1',
              patientName: 'Alice Brown',
              date: '2023-07-14T16:45:00',
              riskLevel: 'high',
              status: 'pending',
              patientId: 'pat321'
            },
            {
              id: 'assess2',
              patientName: 'Robert Wilson',
              date: '2023-07-14T11:30:00',
              riskLevel: 'moderate',
              status: 'pending',
              patientId: 'pat654'
            },
            {
              id: 'assess3',
              patientName: 'Sarah Miller',
              date: '2023-07-13T15:00:00',
              riskLevel: 'low',
              status: 'reviewed',
              patientId: 'pat987'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const getRiskBadgeVariant = (risk) => {
    switch(risk) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };
  
  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      case 'reviewed': return 'primary';
      default: return 'secondary';
    }
  };
  
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
        emergencyContact: {
          name: newPatientForm.emergencyContact,
          relationship: newPatientForm.relationship,
          phone: newPatientForm.emergencyPhone
        },
        medicalHistory: medicalHistoryArray,
        createdBy: auth.user.id // Track which doctor created this patient
      };
      
      // Make API call to create patient
      const response = await api.post('/api/v1/doctors/patients', patientData);
      
      if (response.data.success) {
        setFormSuccess('Patient created successfully!');
        setCreatedPatientId(response.data.data._id);
        // Optionally refresh dashboard data
        // fetchDashboardData();
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
  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your dashboard...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <PageHeader 
        title="Doctor Dashboard"
        subtitle={`Welcome, Dr. ${auth?.user?.name || 'User'} - Manage patients and risk assessments`}
        buttonText="New Patient Assessment"
        buttonIcon="plus-circle"
        buttonVariant="primary"
        buttonAction={() => navigate('/doctor/new-assessment')}
      />
      
      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Patient Assessments</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/doctor/assessments')}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Assessment content would go here */}
              <div className="text-center py-3">
                <p className="text-muted">Recent patient assessments will appear here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">High-Risk Patients</h5>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => navigate('/doctor/patients?risk=high')}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {/* High-risk patients content would go here */}
              <div className="text-center py-3">
                <p className="text-muted">High-risk patients will appear here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Upcoming Appointments</h5>
            </Card.Header>
            <Card.Body>
              {/* Appointments content would go here */}
              <div className="text-center py-3">
                <p className="text-muted">Upcoming appointments will appear here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
    </Container>
  );
};

export default DoctorDashboard;
