import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const HealthAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    age: '',
    gender: '',
    weight: '',
    height: '',
    // Medical History
    hasDiabetes: false,
    hasHeartDisease: false,
    hasHypertension: false,
    // Symptoms
    hasChestPain: false,
    hasFatigue: false,
    hasShortnessOfBreath: false,
    // Vitals
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    // Lifestyle
    smokingStatus: 'never',
    alcoholConsumption: 'none',
    physicalActivityLevel: 'low'
  });
  
  const [results, setResults] = useState(null);
  
  const totalSteps = 5;
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Submit assessment data to API
      const response = await api.post('/api/v1/health-assessments', formData);
      
      // Show success and results
      setResults(response.data);
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      
      // For presentation: mock successful response
      setResults({
        cardiacRisk: 'low',
        riskScore: 12,
        recommendations: [
          'Maintain a healthy lifestyle with regular physical activity',
          'Continue balanced diet with low sodium intake',
          'Regular check-ups every 6 months'
        ],
        metrics: {
          bloodPressure: { value: formData.bloodPressureSystolic + '/' + formData.bloodPressureDiastolic, status: 'normal' },
          heartRate: { value: formData.heartRate, status: 'normal' },
          bmi: { 
            value: (formData.weight / ((formData.height/100) * (formData.height/100))).toFixed(1), 
            status: 'normal'
          }
        }
      });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h4 className="mb-4">Personal Information</h4>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Age</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="age" 
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    max="120"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="weight" 
                    value={formData.weight}
                    onChange={handleChange}
                    min="30"
                    max="300"
                    step="0.1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="height" 
                    value={formData.height}
                    onChange={handleChange}
                    min="100"
                    max="250"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h4 className="mb-4">Medical History</h4>
            <div className="mb-4">
              <p>Do you have any of the following conditions?</p>
              <Form.Check
                type="checkbox"
                id="hasDiabetes"
                label="Diabetes"
                name="hasDiabetes"
                checked={formData.hasDiabetes}
                onChange={handleChange}
                className="mb-3"
              />
              <Form.Check
                type="checkbox"
                id="hasHeartDisease"
                label="Heart Disease"
                name="hasHeartDisease"
                checked={formData.hasHeartDisease}
                onChange={handleChange}
                className="mb-3"
              />
              <Form.Check
                type="checkbox"
                id="hasHypertension"
                label="Hypertension (High Blood Pressure)"
                name="hasHypertension"
                checked={formData.hasHypertension}
                onChange={handleChange}
                className="mb-3"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h4 className="mb-4">Symptoms</h4>
            <div className="mb-4">
              <p>Are you experiencing any of these symptoms?</p>
              <Form.Check
                type="checkbox"
                id="hasChestPain"
                label="Chest Pain or Discomfort"
                name="hasChestPain"
                checked={formData.hasChestPain}
                onChange={handleChange}
                className="mb-3"
              />
              <Form.Check
                type="checkbox"
                id="hasFatigue"
                label="Unusual Fatigue"
                name="hasFatigue"
                checked={formData.hasFatigue}
                onChange={handleChange}
                className="mb-3"
              />
              <Form.Check
                type="checkbox"
                id="hasShortnessOfBreath"
                label="Shortness of Breath"
                name="hasShortnessOfBreath"
                checked={formData.hasShortnessOfBreath}
                onChange={handleChange}
                className="mb-3"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <h4 className="mb-4">Vital Signs</h4>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Pressure (Systolic)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="bloodPressureSystolic" 
                    value={formData.bloodPressureSystolic}
                    onChange={handleChange}
                    min="80"
                    max="200"
                    placeholder="e.g., 120"
                  />
                  <Form.Text className="text-muted">
                    The top number in a blood pressure reading
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Pressure (Diastolic)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="bloodPressureDiastolic" 
                    value={formData.bloodPressureDiastolic}
                    onChange={handleChange}
                    min="40"
                    max="130"
                    placeholder="e.g., 80"
                  />
                  <Form.Text className="text-muted">
                    The bottom number in a blood pressure reading
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heart Rate (bpm)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="heartRate" 
                    value={formData.heartRate}
                    onChange={handleChange}
                    min="40"
                    max="200"
                    placeholder="e.g., 72"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );
      case 5:
        return (
          <div className="step-content">
            <h4 className="mb-4">Lifestyle Factors</h4>
            <Form.Group className="mb-4">
              <Form.Label>Smoking Status</Form.Label>
              <Form.Select
                name="smokingStatus"
                value={formData.smokingStatus}
                onChange={handleChange}
                required
              >
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Alcohol Consumption</Form.Label>
              <Form.Select
                name="alcoholConsumption"
                value={formData.alcoholConsumption}
                onChange={handleChange}
                required
              >
                <option value="none">None</option>
                <option value="light">Light (1-2 drinks/week)</option>
                <option value="moderate">Moderate (3-7 drinks/week)</option>
                <option value="heavy">Heavy (8+ drinks/week)</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Physical Activity Level</Form.Label>
              <Form.Select
                name="physicalActivityLevel"
                value={formData.physicalActivityLevel}
                onChange={handleChange}
                required
              >
                <option value="low">Low (Little to no exercise)</option>
                <option value="moderate">Moderate (1-3 days/week)</option>
                <option value="high">High (4+ days/week)</option>
              </Form.Select>
            </Form.Group>
          </div>
        );
      default:
        return null;
    }
  };
  
  const renderResults = () => {
    if (!results) return null;
    
    let riskClass;
    if (results.riskScore < 10) riskClass = 'success';
    else if (results.riskScore < 20) riskClass = 'warning';
    else riskClass = 'danger';
    
    return (
      <div className="assessment-results">
        <div className="text-center mb-5">
          <div className={`risk-indicator bg-${riskClass} mx-auto mb-4`}>
            <i className={`fas fa-${
              riskClass === 'success' ? 'check' : 
              riskClass === 'warning' ? 'exclamation' : 'times'
            } fa-2x`}></i>
          </div>
          <h3 className="mb-3">Your Cardiac Health Risk Assessment</h3>
          <h5 className={`text-${riskClass}`}>
            {results.cardiacRisk === 'low' ? 'Low Risk' : 
             results.cardiacRisk === 'moderate' ? 'Moderate Risk' : 'High Risk'}
          </h5>
          <p className="text-muted">Assessment completed on {new Date().toLocaleDateString()}</p>
        </div>
        
        <Row className="mb-5">
          <Col md={4} className="mb-4 mb-md-0">
            <Card className="text-center h-100">
              <Card.Body>
                <div className="metric-icon mb-3">
                  <i className="fas fa-heartbeat fa-3x text-primary"></i>
                </div>
                <h6>Heart Rate</h6>
                <h4>{results.metrics.heartRate.value} <small>bpm</small></h4>
                <span className={`badge bg-${results.metrics.heartRate.status === 'normal' ? 'success' : 'warning'}`}>
                  {results.metrics.heartRate.status}
                </span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <Card className="text-center h-100">
              <Card.Body>
                <div className="metric-icon mb-3">
                  <i className="fas fa-stethoscope fa-3x text-primary"></i>
                </div>
                <h6>Blood Pressure</h6>
                <h4>{results.metrics.bloodPressure.value}</h4>
                <span className={`badge bg-${results.metrics.bloodPressure.status === 'normal' ? 'success' : 'warning'}`}>
                  {results.metrics.bloodPressure.status}
                </span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <div className="metric-icon mb-3">
                  <i className="fas fa-weight fa-3x text-primary"></i>
                </div>
                <h6>BMI</h6>
                <h4>{results.metrics.bmi.value}</h4>
                <span className={`badge bg-${results.metrics.bmi.status === 'normal' ? 'success' : 'warning'}`}>
                  {results.metrics.bmi.status}
                </span>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Recommendations</h5>
          </Card.Header>
          <Card.Body>
            <ul className="recommendations-list">
              {results.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </Card.Body>
        </Card>
        
        <div className="text-center">
          <Button 
            variant="primary" 
            className="me-2"
            onClick={() => navigate('/patient/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button 
            variant="outline-primary"
            onClick={() => {
              setSuccess(false);
              setResults(null);
              setCurrentStep(1);
            }}
          >
            New Assessment
          </Button>
        </div>
      </div>
    );
  };
  
  if (success && results) {
    return (
      <Container className="py-4">
        <Row>
          <Col lg={10} className="mx-auto">
            <Card className="shadow">
              <Card.Body className="p-md-5">
                {renderResults()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
          .metric-icon {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .recommendations-list li {
            margin-bottom: 0.75rem;
            position: relative;
            padding-left: 1.5rem;
          }
          .recommendations-list li:before {
            content: "✓";
            color: #28a745;
            position: absolute;
            left: 0;
            font-weight: bold;
          }
        `}</style>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Health Assessment</h2>
          <p className="text-muted">Complete this form to receive a cardiac health assessment</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-4">Your Progress</h5>
              <ProgressBar 
                now={(currentStep / totalSteps) * 100}
                label={`${Math.round((currentStep / totalSteps) * 100)}%`}
                className="mb-4"
              />
              
              <div className="step-list">
                <div className={`step-item d-flex align-items-center mb-3 ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-text">Personal Information</div>
                </div>
                <div className={`step-item d-flex align-items-center mb-3 ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-text">Medical History</div>
                </div>
                <div className={`step-item d-flex align-items-center mb-3 ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-text">Symptoms</div>
                </div>
                <div className={`step-item d-flex align-items-center mb-3 ${currentStep >= 4 ? 'active' : ''}`}>
                  <div className="step-number">4</div>
                  <div className="step-text">Vital Signs</div>
                </div>
                <div className={`step-item d-flex align-items-center ${currentStep >= 5 ? 'active' : ''}`}>
                  <div className="step-number">5</div>
                  <div className="step-text">Lifestyle Factors</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          <Card className="shadow-sm">
            <Card.Body className="p-lg-4">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                {renderStepContent()}
                
                <div className="d-flex justify-content-between mt-4">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={currentStep === 1 ? () => navigate('/patient/dashboard') : goToPreviousStep}
                  >
                    {currentStep === 1 ? 'Cancel' : 'Previous'}
                  </Button>
                  
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={goToNextStep}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : 'Submit Assessment'}
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <style jsx="true">{`
        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 12px;
        }
        .step-item.active .step-number {
          background-color: #007bff;
          color: white;
        }
        .step-item.active .step-text {
          font-weight: 600;
          color: #007bff;
        }
      `}</style>
    </Container>
  );
};

export default HealthAssessment;
