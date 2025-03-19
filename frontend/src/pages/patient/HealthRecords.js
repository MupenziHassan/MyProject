import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Nav, Tab, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HealthRecords = () => {
  const [activeTab, setActiveTab] = useState('assessments');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchHealthRecords = async () => {
      setLoading(true);
      try {
        if (activeTab === 'assessments') {
          const response = await api.get('/api/v1/patient/assessments');
          setAssessments(response.data.data);
        } else {
          // Handle other tabs data fetching
        }
      } catch (error) {
        console.log('Using mock assessment data');
        // Mock data for presentation
        if (activeTab === 'assessments') {
          setAssessments(generateMockAssessments());
        }
        setError('Failed to fetch real data. Using demo data for presentation.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthRecords();
  }, [activeTab]);
  
  const generateMockAssessments = () => {
    return [
      {
        _id: '1',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        height: 175,
        weight: 70,
        riskAssessment: {
          bmi: 22.9,
          bmiCategory: 'Normal',
          cancerRiskLevel: 'Low',
        },
        doctor: { name: 'Dr. Smith' }
      },
      {
        _id: '2',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        height: 175,
        weight: 73,
        riskAssessment: {
          bmi: 23.8,
          bmiCategory: 'Normal',
          cancerRiskLevel: 'Low',
        },
        doctor: { name: 'Dr. Williams' }
      },
      {
        _id: '3',
        date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        height: 175,
        weight: 77,
        riskAssessment: {
          bmi: 25.1,
          bmiCategory: 'Overweight',
          cancerRiskLevel: 'Moderate',
        },
        doctor: { name: 'Dr. Johnson' }
      }
    ];
  };
  
  const prepareChartData = () => {
    const sortedAssessments = [...assessments].sort((a, b) => 
      new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedAssessments.map(assessment => new Date(assessment.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Weight (kg)',
          data: sortedAssessments.map(assessment => assessment.weight),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        },
        {
          label: 'BMI',
          data: sortedAssessments.map(assessment => assessment.riskAssessment.bmi),
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.4
        }
      ]
    };
  };
  
  return (
    <Container>
      <PageHeader title="Health Records" />
      <Card>
        <Card.Body>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="assessments">Assessments</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="vitals">Vitals</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tests">Tests</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="medications">Medications</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="assessments">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <div>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Doctor</th>
                          <th>BMI (Category)</th>
                          <th>Cancer Risk Level</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessments.map(assessment => (
                          <tr key={assessment._id}>
                            <td>{new Date(assessment.date).toLocaleDateString()}</td>
                            <td>{assessment.doctor?.name || 'N/A'}</td>
                            <td>{assessment.riskAssessment.bmi} ({assessment.riskAssessment.bmiCategory})</td>
                            <td>
                              <Badge bg={
                                assessment.riskAssessment.cancerRiskLevel === 'Low' ? 'success' :
                                assessment.riskAssessment.cancerRiskLevel === 'Moderate' ? 'warning' : 'danger'
                              }>
                                {assessment.riskAssessment.cancerRiskLevel}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => navigate(`/patient/assessments/${assessment._id}`)}
                              >
                                <i className="fas fa-eye me-1"></i> View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab.Pane>
              
              <Tab.Pane eventKey="vitals">
                <div className="text-center py-5">
                  <i className="fas fa-heartbeat text-muted fa-3x mb-3"></i>
                  <h5>Vital Signs History</h5>
                  <p>Your vital signs history will appear here.</p>
                </div>
              </Tab.Pane>
              
              <Tab.Pane eventKey="tests">
                <div className="text-center py-5">
                  <i className="fas fa-vial text-muted fa-3x mb-3"></i>
                  <h5>Lab Test Results</h5>
                  <p>Your lab test results will appear here.</p>
                </div>
              </Tab.Pane>
              
              <Tab.Pane eventKey="medications">
                <div className="text-center py-5">
                  <i className="fas fa-pills text-muted fa-3x mb-3"></i>
                  <h5>Medication History</h5>
                  <p>Your medication history will appear here.</p>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HealthRecords;
