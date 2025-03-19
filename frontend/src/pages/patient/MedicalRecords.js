import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Nav, Tab, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const response = await api.get('/api/v1/patient/medical-records');
        setRecords(response.data);
      } catch (error) {
        console.log('Using mock medical records data');
        // Mock data for presentation
        setRecords([
          {
            id: 'rec1',
            type: 'Lab Results',
            date: '2023-05-15',
            doctor: 'Dr. Mugisha',
            description: 'Complete Blood Count (CBC)',
            status: 'normal',
            fileUrl: '#'
          },
          {
            id: 'rec2',
            type: 'Imaging',
            date: '2023-04-20',
            doctor: 'Dr. Uwase',
            description: 'Chest X-Ray',
            status: 'abnormal',
            fileUrl: '#'
          },
          {
            id: 'rec3',
            type: 'Cancer Screening',
            date: '2023-03-10',
            doctor: 'Dr. Mugisha',
            description: 'Colonoscopy Results',
            status: 'normal',
            fileUrl: '#'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedicalRecords();
  }, []);

  return (
    <Container className="py-4">
      <PageHeader 
        title="Medical Records"
        subtitle="View your health records and test results"
        buttonText="Request Records"
        buttonIcon="file-medical"
        buttonVariant="primary"
        buttonAction={() => navigate('/patient/medical-records/request')}
      />
      
      <Card>
        <Card.Header className="bg-white">
          <Tab.Container defaultActiveKey="all">
            <Nav variant="tabs" className="border-bottom-0">
              <Nav.Item>
                <Nav.Link eventKey="all">All Records</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="lab">Lab Results</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="imaging">Imaging</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="screenings">Cancer Screenings</Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your medical records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-file-medical fa-3x text-muted mb-3"></i>
              <h4>No Medical Records</h4>
              <p>You don't have any medical records in the system yet.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Record Type</th>
                  <th>Description</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.type}</td>
                    <td>{record.description}</td>
                    <td>{record.doctor}</td>
                    <td>
                      <Badge bg={record.status === 'normal' ? 'success' : 'warning'}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/patient/medical-records/${record.id}`)}
                      >
                        <i className="fas fa-eye"></i> View
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        as="a"
                        href={record.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fas fa-download"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MedicalRecords;
