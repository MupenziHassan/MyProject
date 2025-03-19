import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const AssessmentDetail = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAssessmentDetail = async () => {
      try {
        const response = await api.get(`/api/v1/patient/assessments/${assessmentId}`);
        setAssessment(response.data.data);
      } catch (error) {
        console.log('Using mock assessment data');
        // Mock data for presentation
        setAssessment({
          _id: assessmentId,
          date: new Date().toISOString(),
          height: 175,
          weight: 70,
          bloodPressure: '120/80',
          bloodSugar: '95',
          smokingStatus: 'never',
          alcoholConsumption: 'light',
          familyHistory: {
            cancer: true,
            diabetes: false,
            heartDisease: true,
            hypertension: false
          },
          symptoms: 'Patient reports occasional headaches and fatigue.',
          testResults: 'All blood work within normal range.',
          doctorNotes: 'Patient is in good overall health with family history of cancer.',
          recommendations: 'Maintain healthy diet and exercise. Schedule cancer screening annually.',
          riskAssessment: {
            bmi: 22.9,
            bmiCategory: 'Normal',
            riskFactorCount: 2,
            cancerRiskLevel: 'Moderate'
          },
          doctor: {
            name: 'Dr. Elizabeth Johnson',
            specialty: 'Oncology'
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessmentDetail();
  }, [assessmentId]);
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading assessment details...</p>
      </Container>
    );
  }
  
  if (!assessment) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">
          Assessment not found or could not be loaded.
        </div>
        <Button 
          variant="primary"
          onClick={() => navigate('/patient/health-records')}
        >
          Back to Health Records
        </Button>
      </Container>
    );
  }
  
  const riskClass = 
    assessment.riskAssessment.cancerRiskLevel === 'Low' ? 'success' :
    assessment.riskAssessment.cancerRiskLevel === 'Moderate' ? 'warning' : 'danger';
    
  return (
    <Container className="py-4">
      <PageHeader
        title="Assessment Details"
        subtitle={`Health assessment from ${new Date(assessment.date).toLocaleDateString()}`}
        showBackButton={true}
        backPath="/patient/health-records"
      />
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Assessment Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-center mb-4">
                <div className={`risk-indicator bg-${riskClass}`}>
                  <i className={`fas fa-${
                    assessment.riskAssessment.cancerRiskLevel === 'Low' ? 'check' : 
                    assessment.riskAssessment.cancerRiskLevel === 'Moderate' ? 'exclamation' : 'exclamation-triangle'
                  } fa-2x`}></i>
                </div>
              </div>
              
              <h4 className="text-center mb-1">Cancer Risk Level</h4>
              <h3 className={`text-center text-${riskClass} mb-4`}>
                {assessment.riskAssessment.cancerRiskLevel}
              </h3>
              
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <th>Date</th>
                    <td>{new Date(assessment.date).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <th>Doctor</th>
                    <td>{assessment.doctor?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>BMI</th>
                    <td>{assessment.riskAssessment.bmi} ({assessment.riskAssessment.bmiCategory})</td>
                  </tr>
                  <tr>
                    <th>Height</th>
                    <td>{assessment.height} cm</td>
                  </tr>
                  <tr>
                    <th>Weight</th>
                    <td>{assessment.weight} kg</td>
                  </tr>
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Health Metrics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Blood Pressure:</strong> {assessment.bloodPressure || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Blood Sugar:</strong> {assessment.bloodSugar || 'N/A'} mg/dL</p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Smoking Status:</strong> {
                      assessment.smokingStatus === 'never' ? 'Never smoked' :
                      assessment.smokingStatus === 'former' ? 'Former smoker' : 'Current smoker'
                    }
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Alcohol Consumption:</strong> {
                      assessment.alcoholConsumption === 'none' ? 'None' :
                      assessment.alcoholConsumption === 'light' ? 'Light' :
                      assessment.alcoholConsumption === 'moderate' ? 'Moderate' : 'Heavy'
                    }
                  </p>
                </Col>
              </Row>
              
              <h6 className="mt-4 mb-3">Family History</h6>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {assessment.familyHistory.cancer && (
                  <Badge bg="info">Cancer</Badge>
                )}
                {assessment.familyHistory.diabetes && (
                  <Badge bg="info">Diabetes</Badge>
                )}
                {assessment.familyHistory.heartDisease && (
                  <Badge bg="info">Heart Disease</Badge>
                )}
                {assessment.familyHistory.hypertension && (
                  <Badge bg="info">Hypertension</Badge>
                )}
                {!Object.values(assessment.familyHistory).some(v => v) && (
                  <span className="text-muted">No family history reported</span>
                )}
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Doctor's Assessment</h5>
            </Card.Header>
            <Card.Body>
              {assessment.symptoms && (
                <div className="mb-4">
                  <h6>Reported Symptoms</h6>
                  <p>{assessment.symptoms}</p>
                </div>
              )}
              
              {assessment.testResults && (
                <div className="mb-4">
                  <h6>Test Results</h6>
                  <p>{assessment.testResults}</p>
                </div>
              )}
              
              {assessment.doctorNotes && (
                <div className="mb-4">
                  <h6>Doctor's Notes</h6>
                  <p>{assessment.doctorNotes}</p>
                </div>
              )}
              
              <div>
                <h6>Recommendations</h6>
                <p>{assessment.recommendations || 'No specific recommendations provided.'}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <div className="d-flex justify-content-center">
        <Button 
          variant="primary"
          onClick={() => navigate('/patient/appointments/schedule')}
        >
          <i className="fas fa-calendar-plus me-2"></i>
          Schedule Follow-up Appointment
        </Button>
      </div>
      
      <style jsx="true">{`
        .risk-indicator {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      `}</style>
    </Container>
  );
};

export default AssessmentDetail;
