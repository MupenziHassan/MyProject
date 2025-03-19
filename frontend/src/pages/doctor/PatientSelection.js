import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const PatientSelection = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/api/v1/doctor/patients');
        setPatients(response.data.data);
      } catch (error) {
        console.log('Using mock patient data');
        // Mock data for presentation
        setPatients([
          {
            _id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            gender: 'Male',
            age: 45,
            lastAssessment: '2023-05-15T10:30:00Z'
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            gender: 'Female',
            age: 38,
            lastAssessment: '2023-06-22T14:15:00Z'
          },
          {
            _id: '3',
            name: 'Robert Johnson',
            email: 'robert.johnson@example.com',
            gender: 'Male',
            age: 62,
            lastAssessment: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const searchValue = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchValue) ||
      patient.email.toLowerCase().includes(searchValue)
    );
  });

  return (
    <Container className="py-4">
      <PageHeader 
        title="Select Patient"
        subtitle="Choose a patient to create a new health assessment"
        showBackButton={true}
        backPath="/doctor/dashboard"
      />

      <Card className="shadow-sm">
        <Card.Body>
          <Form className="mb-4">
            <InputGroup>
              <Form.Control
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-secondary">
                <i className="fas fa-search"></i>
              </Button>
            </InputGroup>
          </Form>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users text-muted fa-3x mb-3"></i>
              <h5>No patients found</h5>
              <p>Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Last Assessment</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => (
                    <tr key={patient._id}>
                      <td>{patient.name}</td>
                      <td>{patient.email}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.age}</td>
                      <td>
                        {patient.lastAssessment ? 
                          new Date(patient.lastAssessment).toLocaleDateString() : 
                          'No previous assessment'
                        }
                      </td>
                      <td className="text-center">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate(`/doctor/patients/${patient._id}/new-assessment`)}
                        >
                          <i className="fas fa-plus-circle me-1"></i> New Assessment
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PatientSelection;
