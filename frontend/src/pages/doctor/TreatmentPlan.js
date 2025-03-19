import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';

const TreatmentPlan = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatmentType: 'preventive',
    recommendations: '',
    medications: '',
    followUpDate: '',
    additionalTests: '',
    notes: ''
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await api.get(`/api/v1/doctor/patients/${patientId}`);
        setPatient(response.data);
        
        // Check if patient already has a treatment plan
        try {
          const planResponse = await api.get(`/api/v1/doctor/patients/${patientId}/treatment-plan`);
          if (planResponse.data) {
            setFormData(planResponse.data);
          }
        } catch (error) {
          // No existing plan, use defaults
        }
      } catch (error) {
        console.log('Using mock patient data');
        setPatient({
          id: patientId,
          name: 'John Doe',
          age: 45,
          gender: 'Male',
          riskLevel: 'moderate'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/api/v1/doctor/patients/${patientId}/treatment-plan`, formData);
      setSuccess('Treatment plan saved successfully');
    } catch (error) {
      setError('Failed to save treatment plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading patient data...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <PageHeader
        title="Cancer Treatment Plan"
        subtitle={`Create or update treatment plan for ${patient?.name}`}
        showBackButton={true}
        backPath={`/doctor/patients/${patientId}`}
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Treatment Plan Details</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Diagnosis</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Treatment Type</Form.Label>
                  <Form.Select
                    name="treatmentType"
                    value={formData.treatmentType}
                    onChange={handleChange}
                    required
                  >
                    <option value="preventive">Preventive Care</option>
                    <option value="screening">Cancer Screening</option>
                    <option value="earlystage">Early Stage Treatment</option>
                    <option value="advanced">Advanced Treatment</option>
                    <option value="palliative">Palliative Care</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Recommendations</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="recommendations"
                value={formData.recommendations}
                onChange={handleChange}
                placeholder="Enter detailed treatment recommendations"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Medications</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                placeholder="List medications with dosage and frequency"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Follow-up Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Additional Tests Needed</Form.Label>
                  <Form.Control
                    type="text"
                    name="additionalTests"
                    value={formData.additionalTests}
                    onChange={handleChange}
                    placeholder="E.g., MRI, Blood tests, Biopsy"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information or instructions"
              />
            </Form.Group>

            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/doctor/patients/${patientId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Save Treatment Plan
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TreatmentPlan;
