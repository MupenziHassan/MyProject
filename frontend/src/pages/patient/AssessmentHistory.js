import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';

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

const AssessmentHistory = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get('/api/v1/patients/assessments');
        setAssessments(response.data);
      } catch (error) {
        console.log('Using mock assessment data');
        // Generate mock assessment history data for demo
        const mockAssessments = [];
        
        // Create assessments over past 6 months with slightly decreasing risk scores
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
          const assessmentDate = new Date();
          assessmentDate.setMonth(today.getMonth() - i);
          
          // Risk score that improves over time (from ~7 to ~4)
          const baseRiskScore = 7 - (i * 0.5) + (Math.random() * 0.6 - 0.3);
          const riskScore = parseFloat(baseRiskScore.toFixed(1));
          
          mockAssessments.push({
            id: `assessment-${i}`,
            date: assessmentDate.toISOString(),
            riskScore: riskScore,
            riskLevel: riskScore >= 7 ? 'high' : riskScore >= 4.5 ? 'moderate' : 'low',
            cancerTypes: [
              { type: 'Lung', risk: i < 3 ? 'Low' : 'Moderate' },
              { type: 'Colorectal', risk: 'Low' },
              { type: 'Breast', risk: i < 2 ? 'Low' : 'Moderate' }
            ],
            recommendations: [
              'Maintain regular screenings',
              'Continue healthy diet and exercise',
              'Follow up with doctor in 3 months'
            ]
          });
        }
        
        setAssessments(mockAssessments);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, []);
  
  // Prepare data for chart
  const prepareChartData = () => {
    const sortedAssessments = [...assessments].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedAssessments.map(assessment => new Date(assessment.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Cancer Risk Score',
          data: sortedAssessments.map(assessment => assessment.riskScore),
          fill: false,
          backgroundColor: 'rgb(75, 192, 192)',
          borderColor: 'rgba(75, 192, 192, 0.8)',
          tension: 0.3
        }
      ]
    };
  };
  
  const getRiskBadgeVariant = (risk) => {
    return risk === 'low' ? 'success' : risk === 'moderate' ? 'warning' : 'danger';
  };
  
  return (
    <Container className="py-4">
      <PageHeader 
        title="Assessment History"
        subtitle="Track your cancer risk assessments over time"
        buttonText="New Assessment"
        buttonIcon="plus-circle"
        buttonVariant="primary"
        buttonAction={() => navigate('/patient/health-assessment')}
      />
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Risk Score Trend</h5>
            </Card.Header>
            <Card.Body>
              {assessments.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <Line 
                    data={prepareChartData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          min: 0,
                          max: 10,
                          title: {
                            display: true,
                            text: 'Risk Score (0-10)'
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Assessment Date'
                          },
                          grid: {
                            display: false
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context) => `Risk Score: ${context.raw}/10`
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="mb-0">No assessment history available. Complete your first assessment to track your risk over time.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Header className="bg-white">
          <h5 className="mb-0">Past Assessments</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading assessment history...</p>
            </div>
          ) : (
            <>
              {assessments.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                  <h4>No Assessments Yet</h4>
                  <p>Complete your first cancer risk assessment to get personalized insights.</p>
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/patient/health-assessment')}
                  >
                    Take Assessment Now
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Risk Score</th>
                        <th>Risk Level</th>
                        <th>Primary Concerns</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((assessment) => (
                        <tr key={assessment.id}>
                          <td>{new Date(assessment.date).toLocaleDateString()}</td>
                          <td>{assessment.riskScore}/10</td>
                          <td>
                            <Badge bg={getRiskBadgeVariant(assessment.riskLevel)}>
                              {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)}
                            </Badge>
                          </td>
                          <td>
                            {assessment.cancerTypes
                              .filter(cancer => cancer.risk !== 'Low')
                              .map(cancer => cancer.type)
                              .join(', ') || 'None identified'}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/patient/assessments/${assessment.id}`)}
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
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AssessmentHistory;
