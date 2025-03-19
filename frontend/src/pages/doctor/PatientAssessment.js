import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const PatientAssessment = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    // Patient Details (pre-filled)
    patientId: '',
    patientName: '',
    
    // Medical Data
    height: '',
    weight: '',
    bloodPressure: '',
    bloodSugar: '',
    
    // Risk Factors
    smokingStatus: 'never',
    alcoholConsumption: 'none',
    familyHistory: {
      cancer: false,
      diabetes: false,
      heartDisease: false,
      hypertension: false
    },
    
    // Clinical Observations
    symptoms: '',
    testResults: '',
    
    // Doctor's Assessment
    doctorNotes: '',
    recommendations: ''
  });
  
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await api.get(`/api/v1/doctor/patients/${patientId}`);
        const patientData = response.data;
        
        setPatient(patientData);
        setFormData(prev => ({
          ...prev,
          patientId: patientData.id,
          patientName: patientData.name,
          // Pre-fill with existing medical data if available
          height: patientData.height || '',
          weight: patientData.weight || '',
          // ... other pre-filled fields
        }));
        
      } catch (err) {
        // For demo purposes
        console.log('Using mock patient data');
        const mockPatient = {
          id: patientId || '123456',
          name: 'John Doe',
          age: 42,
          gender: 'Male',
          contactNumber: '+25078123456',
          email: 'john.doe@example.com'
        };
        
        setPatient(mockPatient);
        setFormData(prev => ({
          ...prev,
          patientId: mockPatient.id,
          patientName: mockPatient.name
        }));
        
        setError('Could not fetch real patient data. Using demo data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [patientId]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., familyHistory.cancer)
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
  
  const calculateBMI = () => {
    if (!formData.height || !formData.weight) return '';
    
    const heightInMeters = parseFloat(formData.height) / 100;
    const weightInKg = parseFloat(formData.weight);
    
    if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters <= 0) return '';
    
    const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
  };
  
  const generateRiskAssessment = () => {
    // Calculate BMI
    const bmi = calculateBMI();
    
    // Determine BMI category
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
    
    // Count risk factors
    let riskFactorCount = 0;
    
    if (bmi >= 30) riskFactorCount++; // Obesity
    if (formData.smokingStatus === 'current') riskFactorCount += 2;
    if (formData.smokingStatus === 'former') riskFactorCount++;
    if (formData.alcoholConsumption === 'heavy') riskFactorCount++;
    
    // Count family history factors
    Object.values(formData.familyHistory).forEach(value => {
      if (value) riskFactorCount++;
    });
    
    // Determine cancer risk level (simplified for demo)
    let cancerRiskLevel = 'Low';
    if (riskFactorCount >= 4) {
      cancerRiskLevel = 'High';
    } else if (riskFactorCount >= 2) {
      cancerRiskLevel = 'Moderate';
    }
    
    return {
      bmi,
      bmiCategory,
      riskFactorCount,
      cancerRiskLevel
    };
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const riskAssessment = generateRiskAssessment();
      
      // Create assessment object
      const assessmentData = {
        ...formData,
        assessmentDate: new Date().toISOString(),
        riskAssessment,
        doctorId: localStorage.getItem('userId') // Assuming you store the logged-in user ID
      };
      
      // Submit to API
      await api.post('/api/v1/doctor/assessments', assessmentData);
      
      setSuccess('Assessment successfully saved and patient has been notified.');
      
      // Redirect to patient details after 2 seconds
      setTimeout(() => {
        navigate(`/doctor/patients/${patientId}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to save assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading patient data...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <PageHeader
        title="New Patient Assessment"
        subtitle={`Enter health data for ${patient?.name || 'Patient'}`}
        showBackButton={true}
        backPath={`/doctor/patients/${patientId}`}
      />
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}
      
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="mb-3">Patient Information</h5>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.patientName}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.patientId}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="mb-3">Medical Data</h5>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="100"
                    max="250"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="30"
                    max="300"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Pressure</Form.Label>
                  <Form.Control
                    type="text"
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                    placeholder="e.g., 120/80"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Sugar (mg/dL)</Form.Label>
                  <Form.Control
                    type="number"
                    name="bloodSugar"
                    value={formData.bloodSugar}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="mb-3">Risk Factors</h5>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Smoking Status</Form.Label>
                  <Form.Select
                    name="smokingStatus"
                    value={formData.smokingStatus}
                    onChange={handleChange}
                  >
                    <option value="never">Never Smoked</option>
                    <option value="former">Former Smoker</option>
                    <option value="current">Current Smoker</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Alcohol Consumption</Form.Label>
                  <Form.Select
                    name="alcoholConsumption"
                    value={formData.alcoholConsumption}
                    onChange={handleChange}
                  >
                    <option value="none">None</option>
                    <option value="light">Light (Occasional)</option>
                    <option value="moderate">Moderate (Weekly)</option>
                    <option value="heavy">Heavy (Daily)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="mb-3">Family History</h5>
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  id="familyHistoryCancer"
                  label="Cancer"
                  name="familyHistory.cancer"
                  checked={formData.familyHistory.cancer}
                  onChange={handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  id="familyHistoryDiabetes"
                  label="Diabetes"
                  name="familyHistory.diabetes"
                  checked={formData.familyHistory.diabetes}
                  onChange={handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  id="familyHistoryHeartDisease"
                  label="Heart Disease"
                  name="familyHistory.heartDisease"
                  checked={formData.familyHistory.heartDisease}
                  onChange={handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  id="familyHistoryHypertension"
                  label="Hypertension"
                  name="familyHistory.hypertension"
                  checked={formData.familyHistory.hypertension}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="mb-3">Clinical Observations</h5>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Symptoms</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    placeholder="Enter patient's reported symptoms"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Test Results</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="testResults"
                    value={formData.testResults}
                    onChange={handleChange}
                    placeholder="Enter any relevant test results"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="mb-3">Doctor's Assessment</h5>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="doctorNotes"
                    value={formData.doctorNotes}
                    onChange={handleChange}
                    placeholder="Enter your clinical notes"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Recommendations</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="recommendations"
                    value={formData.recommendations}
                    onChange={handleChange}
                    placeholder="Enter recommendations for the patient"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {formData.height && formData.weight && (
              <Row className="mb-4">
                <Col md={12}>
                  <Card className="bg-light">
                    <Card.Body>
                      <h5>Generated Assessment</h5>
                      <p className="mb-2">
                        <strong>BMI:</strong> {calculateBMI()} ({generateRiskAssessment().bmiCategory})
                      </p>
                      <p className="mb-2">
                        <strong>Cancer Risk Level:</strong> <span className={`text-${generateRiskAssessment().cancerRiskLevel === 'Low' ? 'success' : generateRiskAssessment().cancerRiskLevel === 'Moderate' ? 'warning' : 'danger'}`}>{generateRiskAssessment().cancerRiskLevel}</span>
                      </p>
                      <p className="mb-0">
                        <small className="text-muted">This preliminary assessment is based on the data entered. Clinical judgment should be used to make final recommendations.</small>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate(`/doctor/patients/${patientId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : 'Save Assessment'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PatientAssessment;
