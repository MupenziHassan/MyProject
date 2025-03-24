import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CancerRiskAssessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Form data with cancer-specific risk factors
  const [formData, setFormData] = useState({
    // Demographics
    age: '',
    gender: '',
    ethnicity: '',
    
    // General health info
    height: '',
    weight: '',
    
    // Risk factors
    smokingStatus: 'never',
    alcoholConsumption: 'none',
    
    // Family history
    familyHistory: {
      breast: false,
      colorectal: false,
      lung: false,
      prostate: false,
      skin: false
    },
    
    // Symptoms
    symptoms: {
      unexplainedWeightLoss: false,
      fatigue: false,
      pain: false,
      skinChanges: false,
      cough: false,
      bleedingOrDischarge: false
    }
  });
  
  const [results, setResults] = useState(null);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., familyHistory.breast)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  // Navigate between form steps
  const nextStep = () => {
    if (step === 1 && (!formData.age || !formData.gender)) {
      setError("Please fill in all required fields");
      return;
    }
    
    setError(null);
    setStep(prevStep => prevStep + 1);
  };
  
  const prevStep = () => {
    setError(null);
    setStep(prevStep => prevStep - 1);
  };
  
  // Submit assessment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call for demo
      // const response = await api.post('/api/v1/assessments', formData);
      setTimeout(() => {
        const mockResults = {
          overallRisk: { level: 'Moderate', score: '5.2' },
          specificRisks: [
            { type: 'Breast', score: formData.gender === 'female' ? '4.8' : 'N/A', level: 'Moderate' },
            { type: 'Colorectal', score: '3.5', level: 'Low' },
            { type: 'Lung', score: formData.smokingStatus === 'current' ? '7.2' : '2.8', level: formData.smokingStatus === 'current' ? 'High' : 'Low' },
            { type: 'Prostate', score: formData.gender === 'male' ? '4.0' : 'N/A', level: 'Moderate' },
            { type: 'Skin', score: '2.1', level: 'Low' }
          ],
          recommendations: [
            "Complete regular cancer screenings based on your age and risk factors",
            "Maintain a balanced diet rich in fruits and vegetables",
            "Exercise regularly for at least 150 minutes per week",
            "Schedule a follow-up appointment to discuss your risk profile"
          ]
        };
        
        setResults(mockResults);
        setShowResults(true);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Failed to process your assessment. Please try again.');
      setLoading(false);
    }
  };
  
  // Render form step content
  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <h4 className="mb-4">Personal Information</h4>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Age <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </>
        );
        
      case 2:
        return (
          <>
            <h4 className="mb-4">Health Information</h4>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                  />
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
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Smoking Status</Form.Label>
              <Form.Select
                name="smokingStatus"
                value={formData.smokingStatus}
                onChange={handleChange}
              >
                <option value="never">Never smoked</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Alcohol Consumption</Form.Label>
              <Form.Select
                name="alcoholConsumption"
                value={formData.alcoholConsumption}
                onChange={handleChange}
              >
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </Form.Select>
            </Form.Group>
          </>
        );
        
      case 3:
        return (
          <>
            <h4 className="mb-4">Family Cancer History</h4>
            <p>Has anyone in your immediate family been diagnosed with any of these cancers?</p>
            
            <Form.Check
              type="checkbox"
              id="familyHistoryBreast"
              label="Breast Cancer"
              name="familyHistory.breast"
              checked={formData.familyHistory.breast}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="familyHistoryColorectal"
              label="Colorectal Cancer"
              name="familyHistory.colorectal"
              checked={formData.familyHistory.colorectal}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="familyHistoryLung"
              label="Lung Cancer"
              name="familyHistory.lung"
              checked={formData.familyHistory.lung}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="familyHistoryProstate"
              label="Prostate Cancer"
              name="familyHistory.prostate"
              checked={formData.familyHistory.prostate}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="familyHistorySkin"
              label="Skin Cancer"
              name="familyHistory.skin"
              checked={formData.familyHistory.skin}
              onChange={handleChange}
              className="mb-2"
            />
          </>
        );
        
      case 4:
        return (
          <>
            <h4 className="mb-4">Symptoms</h4>
            <p>Have you experienced any of the following symptoms in the past 3 months?</p>
            
            <Form.Check
              type="checkbox"
              id="symptomsWeightLoss"
              label="Unexplained weight loss"
              name="symptoms.unexplainedWeightLoss"
              checked={formData.symptoms.unexplainedWeightLoss}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="symptomsFatigue"
              label="Persistent fatigue"
              name="symptoms.fatigue"
              checked={formData.symptoms.fatigue}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="symptomsPain"
              label="Unexplained pain"
              name="symptoms.pain"
              checked={formData.symptoms.pain}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="symptomsSkinChanges"
              label="Skin changes or unusual moles"
              name="symptoms.skinChanges"
              checked={formData.symptoms.skinChanges}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="symptomsCough"
              label="Persistent cough"
              name="symptoms.cough"
              checked={formData.symptoms.cough}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="symptomsBleedingOrDischarge"
              label="Unusual bleeding or discharge"
              name="symptoms.bleedingOrDischarge"
              checked={formData.symptoms.bleedingOrDischarge}
              onChange={handleChange}
              className="mb-2"
            />
          </>
        );
        
      default:
        return null;
    }
  };
  
  // Render results view
  const renderResults = () => {
    if (!results) return null;
    
    const overallRiskClass = 
      results.overallRisk.level === 'Low' ? 'success' : 
      results.overallRisk.level === 'Moderate' ? 'warning' : 'danger';
    
    return (
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <div className={`risk-indicator mx-auto mb-3 bg-${overallRiskClass}`}>
              <i className="fas fa-chart-line fa-2x"></i>
            </div>
            <h3>Your Cancer Risk Assessment Results</h3>
            <p className="text-muted mb-3">Based on the information you provided</p>
            <h4 className={`text-${overallRiskClass}`}>
              Overall Risk Level: {results.overallRisk.level}
            </h4>
          </div>
          
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="mb-3">Cancer Type Risk Breakdown</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Cancer Type</th>
                    <th>Risk Level</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results.specificRisks.map((risk, index) => {
                    if (risk.score === 'N/A') return null;
                    
                    const riskClass = 
                      risk.level === 'Low' ? 'success' : 
                      risk.level === 'Moderate' ? 'warning' : 'danger';
                      
                    return (
                      <tr key={index}>
                        <td>{risk.type}</td>
                        <td>
                          <span className={`badge bg-${riskClass}`}>
                            {risk.level}
                          </span>
                        </td>
                        <td>{risk.score}/10</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
            
            <Col md={6}>
              <h5 className="mb-3">Recommendations</h5>
              <ul>
                {results.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
              
              <div className="mt-4">
                <Button 
                  variant="primary"
                  onClick={() => navigate('/patient/appointments/schedule')}
                >
                  <i className="fas fa-calendar-plus me-2"></i>
                  Schedule Follow-up
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <Container className="py-4">
      {showResults ? (
        <>
          <h2 className="mb-4">Your Cancer Risk Assessment Results</h2>
          {renderResults()}
          <div className="mt-4 text-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setShowResults(false);
                setStep(1);
              }}
            >
              <i className="fas fa-redo me-2"></i>
              Start New Assessment
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="mb-4">Cancer Risk Assessment</h2>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="mb-4">
                <ProgressBar now={(step / 4) * 100} label={`Step ${step} of 4`} />
              </div>
              
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                {renderStepContent()}
                
                <div className="d-flex justify-content-between mt-4">
                  {step > 1 ? (
                    <Button variant="outline-secondary" onClick={prevStep}>
                      <i className="fas fa-arrow-left me-2"></i>
                      Previous
                    </Button>
                  ) : (
                    <Button variant="outline-secondary" onClick={() => navigate('/patient/dashboard')}>
                      Cancel
                    </Button>
                  )}
                  
                  {step < 4 ? (
                    <Button variant="primary" onClick={nextStep}>
                      Next
                      <i className="fas fa-arrow-right ms-2"></i>
                    </Button>
                  ) : (
                    <Button type="submit" variant="success" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle me-2"></i>
                          Submit
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
      
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

export default CancerRiskAssessment;
