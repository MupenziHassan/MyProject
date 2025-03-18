import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Nav, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const RiskAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set active tab from URL params if available
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setActiveTab(statusParam);
    }
    
    // Define fetchAssessments inside useEffect
    const fetchAssessments = async () => {
      try {
        // Try to fetch from API
        const response = await api.get(`/api/v1/doctor/assessments?status=${activeTab}`);
        setAssessments(response.data);
      } catch (error) {
        console.log('Using mock assessment data');
        // Mock data for presentation
        const mockData = [
          {
            id: 'assess1',
            patientName: 'Alice Brown',
            patientId: 'pat321',
            date: '2023-07-14T16:45:00',
            riskScore: 7.8,
            riskLevel: 'high',
            status: 'pending',
            assessmentType: 'Breast Cancer',
            symptoms: ['Lump in breast', 'Skin changes']
          },
          {
            id: 'assess2',
            patientName: 'Robert Wilson',
            patientId: 'pat654',
            date: '2023-07-14T11:30:00',
            riskScore: 4.5,
            riskLevel: 'moderate',
            status: 'pending',
            assessmentType: 'Lung Cancer',
            symptoms: ['Persistent cough', 'Chest pain']
          },
          {
            id: 'assess3',
            patientName: 'Sarah Miller',
            patientId: 'pat987',
            date: '2023-07-13T15:00:00',
            riskScore: 2.1,
            riskLevel: 'low',
            status: 'reviewed',
            assessmentType: 'Colorectal Cancer',
            reviewedBy: 'Dr. Johnson',
            reviewDate: '2023-07-13T17:30:00',
            recommendation: 'Regular screening'
          },
          {
            id: 'assess4',
            patientName: 'Thomas Lee',
            patientId: 'pat135',
            date: '2023-07-12T09:30:00',
            riskScore: 8.3,
            riskLevel: 'high',
            status: 'reviewed',
            assessmentType: 'Prostate Cancer',
            reviewedBy: 'Dr. Martinez',
            reviewDate: '2023-07-12T14:15:00',
            recommendation: 'Immediate follow-up'
          },
          {
            id: 'assess5',
            patientName: 'Linda Garcia',
            patientId: 'pat246',
            date: '2023-07-11T13:45:00',
            riskScore: 5.7,
            riskLevel: 'moderate',
            status: 'reviewed',
            assessmentType: 'Skin Cancer',
            reviewedBy: 'Dr. Johnson',
            reviewDate: '2023-07-11T16:00:00',
            recommendation: 'Schedule biopsy'
          }
        ];
        
        // Filter assessments based on active tab
        let filteredData;
        if (activeTab === 'pending') {
          filteredData = mockData.filter(a => a.status === 'pending');
        } else if (activeTab === 'reviewed') {
          filteredData = mockData.filter(a => a.status === 'reviewed');
        } else if (activeTab === 'high-risk') {
          filteredData = mockData.filter(a => a.riskLevel === 'high');
        } else {
          filteredData = mockData;
        }
        
        setAssessments(filteredData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, [searchParams, activeTab]); // No need to include fetchAssessments
  
  const handleReviewComplete = async (assessmentId) => {
    // In a real application, navigate to review page instead
    navigate(`/doctor/assessments/${assessmentId}`);
  };
  
  const getRiskBadgeVariant = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };
  
  const filteredAssessments = assessments.filter(assessment =>
    assessment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.assessmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading risk assessments...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">Cancer Risk Assessments</h2>
      
      {activeTab === 'pending' && assessments.length > 0 && (
        <Alert variant="warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          You have {assessments.length} assessment(s) waiting for review.
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Header className="bg-white">
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="border-bottom-0"
          >
            <Nav.Item>
              <Nav.Link eventKey="pending">Pending Review</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="reviewed">Reviewed</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="high-risk">High Risk</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="all">All Assessments</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6} lg={4}>
              <Form.Control
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={6} lg={4} className="ms-auto text-md-end mt-3 mt-md-0">
              <span className="text-muted">
                {filteredAssessments.length} assessment(s) found
              </span>
            </Col>
          </Row>
          
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-clipboard-check text-muted fa-4x mb-3"></i>
              <h5>No assessments found</h5>
              <p className="text-muted">
                {activeTab === 'pending' 
                  ? "Great job! You've reviewed all assessments."
                  : "No assessments in this category."}
              </p>
            </div>
          ) : (
            <div>
              {filteredAssessments.map(assessment => (
                <Card 
                  key={assessment.id} 
                  className={`mb-3 assessment-card border-start border-5 ${
                    assessment.riskLevel === 'high' 
                      ? 'border-danger' 
                      : assessment.riskLevel === 'moderate' 
                        ? 'border-warning'
                        : 'border-success'
                  }`}
                >
                  <Card.Body>
                    <Row>
                      <Col md={7}>
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar-circle bg-dark text-white me-3">
                            {assessment.patientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="mb-0">{assessment.patientName}</h5>
                            <small className="text-muted">Patient ID: {assessment.patientId}</small>
                          </div>
                        </div>
                        
                        <p className="mb-1">
                          <strong>Assessment Type:</strong> {assessment.assessmentType}
                        </p>
                        <p className="mb-1">
                          <strong>Date:</strong> {new Date(assessment.date).toLocaleString()}
                        </p>
                        <p className="mb-1">
                          <strong>Risk Score:</strong> {assessment.riskScore}/10
                        </p>
                        
                        {assessment.symptoms && (
                          <div className="mt-2">
                            <strong>Reported Symptoms:</strong>
                            <ul className="mb-0 ps-3">
                              {assessment.symptoms.map((symptom, index) => (
                                <li key={index}>{symptom}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {assessment.recommendation && (
                          <div className="mt-2">
                            <strong>Recommendation:</strong> {assessment.recommendation}
                          </div>
                        )}
                      </Col>
                      
                      <Col md={5} className="d-flex flex-column justify-content-between">
                        <div className="text-md-end mb-3">
                          <Badge 
                            bg={getRiskBadgeVariant(assessment.riskLevel)}
                            className="fs-6 px-3 py-2"
                          >
                            {assessment.riskLevel.toUpperCase()} RISK
                          </Badge>
                          
                          <div className="mt-2 small">
                            <Badge bg={assessment.status === 'pending' ? 'warning' : 'success'}>
                              {assessment.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-md-auto text-md-end">
                          {assessment.status === 'reviewed' ? (
                            <div className="text-muted small mb-2">
                              <div>Reviewed by: {assessment.reviewedBy}</div>
                              <div>Date: {new Date(assessment.reviewDate).toLocaleString()}</div>
                            </div>
                          ) : (
                            <Button 
                              variant="warning" 
                              onClick={() => handleReviewComplete(assessment.id)}
                              className="mt-3 mt-md-0"
                            >
                              <i className="fas fa-stethoscope me-2"></i>
                              Review Assessment
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline-secondary" 
                            className="mt-2 ms-md-2"
                            onClick={() => navigate(`/doctor/patients/${assessment.patientId}`)}
                          >
                            <i className="fas fa-user me-2"></i>
                            Patient Profile
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
      
      <style jsx="true">{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .assessment-card {
          transition: box-shadow 0.2s;
        }
        .assessment-card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1);
        }
      `}</style>
    </Container>
  );
};

export default RiskAssessments;
