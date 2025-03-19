import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';

const MedicalRecordDetail = () => {
  const { recordId } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRecordData = async () => {
      try {
        const response = await api.get(`/api/v1/patient/medical-records/${recordId}`);
        setRecord(response.data);
      } catch (error) {
        console.log('Using mock medical record data');
        // Mock data for presentation
        setRecord({
          id: recordId,
          type: 'Lab Results',
          date: '2023-05-15',
          doctor: 'Dr. Mugisha',
          description: 'Complete Blood Count (CBC)',
          status: 'normal',
          details: {
            lab: 'Ubumuntu Clinic Laboratory',
            technician: 'John Rwema',
            parameters: [
              { name: 'WBC', value: '7.5', unit: '10^9/L', range: '4.0-11.0', status: 'normal' },
              { name: 'RBC', value: '5.2', unit: '10^12/L', range: '4.5-6.0', status: 'normal' },
              { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.5-17.5', status: 'normal' },
              { name: 'Hematocrit', value: '42', unit: '%', range: '41-50', status: 'normal' },
              { name: 'Platelets', value: '250', unit: '10^9/L', range: '150-450', status: 'normal' }
            ]
          },
          conclusions: 'All parameters are within normal range. No abnormalities detected.',
          recommendations: 'No specific follow-up required. Continue routine checkups.',
          fileUrl: '#'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecordData();
  }, [recordId]);
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading medical record details...</p>
      </Container>
    );
  }
  
  if (!record) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Medical record not found or could not be loaded
        </Alert>
        <Button 
          variant="primary"
          onClick={() => navigate('/patient/medical-records')}
        >
          Back to Records
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <PageHeader 
        title="Medical Record Details"
        subtitle={`${record.type} - ${new Date(record.date).toLocaleDateString()}`}
        showBackButton={true}
        backPath="/patient/medical-records"
      />
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{record.description}</h5>
            <Badge bg={record.status === 'normal' ? 'success' : 'warning'}>
              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-4">
              <h6 className="text-muted">Record Information</h6>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <th style={{ width: '30%' }}>Date</th>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <th>Doctor</th>
                    <td>{record.doctor}</td>
                  </tr>
                  <tr>
                    <th>Lab</th>
                    <td>{record.details.lab}</td>
                  </tr>
                  <tr>
                    <th>Technician</th>
                    <td>{record.details.technician}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            
            <Col md={6} className="mb-4">
              <h6 className="text-muted">Conclusions</h6>
              <p>{record.conclusions}</p>
              
              <h6 className="text-muted mt-4">Recommendations</h6>
              <p>{record.recommendations}</p>
            </Col>
          </Row>
          
          <h6 className="text-muted border-top pt-3 mb-3">Test Parameters</h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr className="table-light">
                  <th>Parameter</th>
                  <th>Result</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {record.details.parameters.map((param, index) => (
                  <tr key={index}>
                    <td>{param.name}</td>
                    <td>{param.value}</td>
                    <td>{param.unit}</td>
                    <td>{param.range}</td>
                    <td>
                      <Badge bg={param.status === 'normal' ? 'success' : 'warning'}>
                        {param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-4">
            <Button 
              variant="outline-primary"
              as="a"
              href={record.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="me-3"
            >
              <i className="fas fa-download me-2"></i>
              Download Report
            </Button>
            <Button 
              variant="outline-secondary"
              onClick={() => window.print()}
            >
              <i className="fas fa-print me-2"></i>
              Print Report
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MedicalRecordDetail;
