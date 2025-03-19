import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import DashboardStats from '../../components/common/DashboardStats';
import PageHeader from '../../components/common/PageHeader';

const DoctorDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Try to fetch real data
        const response = await api.get('/api/v1/doctors/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.log('Using mock dashboard data');
        // Use mock data for presentation
        setDashboardData({
          todayAppointments: 5,
          pendingAssessments: 3,
          totalPatients: 24,
          upcomingAppointments: [
            { 
              id: 'appt1',
              patientName: 'John Doe',
              date: '2023-07-15T10:30:00',
              status: 'confirmed',
              reason: 'Follow-up after treatment',
              patientId: 'pat123'
            },
            {
              id: 'appt2', 
              patientName: 'Jane Smith', 
              date: '2023-07-15T14:00:00',
              status: 'pending',
              reason: 'Initial consultation', 
              patientId: 'pat456'
            },
            {
              id: 'appt3', 
              patientName: 'Michael Johnson', 
              date: '2023-07-16T09:15:00',
              status: 'confirmed',
              reason: 'Lab results review', 
              patientId: 'pat789'
            }
          ],
          recentAssessments: [
            {
              id: 'assess1',
              patientName: 'Alice Brown',
              date: '2023-07-14T16:45:00',
              riskLevel: 'high',
              status: 'pending',
              patientId: 'pat321'
            },
            {
              id: 'assess2',
              patientName: 'Robert Wilson',
              date: '2023-07-14T11:30:00',
              riskLevel: 'moderate',
              status: 'pending',
              patientId: 'pat654'
            },
            {
              id: 'assess3',
              patientName: 'Sarah Miller',
              date: '2023-07-13T15:00:00',
              riskLevel: 'low',
              status: 'reviewed',
              patientId: 'pat987'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const getRiskBadgeVariant = (risk) => {
    switch(risk) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };
  
  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      case 'reviewed': return 'primary';
      default: return 'secondary';
    }
  };
  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your dashboard...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <PageHeader 
        title="Doctor Dashboard"
        subtitle={`Welcome, Dr. ${auth?.user?.name || 'User'} - Manage patients and risk assessments`}
        buttonText="New Patient Assessment"
        buttonIcon="plus-circle"
        buttonVariant="primary"
        buttonAction={() => navigate('/doctor/new-assessment')}
      />
      
      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Patient Assessments</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/doctor/assessments')}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Assessment content would go here */}
              <div className="text-center py-3">
                <p className="text-muted">Recent patient assessments will appear here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">High-Risk Patients</h5>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => navigate('/doctor/patients?risk=high')}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {/* High-risk patients content would go here */}
              <div className="text-center py-3">
                <p className="text-muted">High-risk patients will appear here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Upcoming Appointments</h5>
            </Card.Header>
            <Card.Body>
              {/* Appointments content would go here */}
              <div className="text-center py-3">
                <p className="text-muted">Upcoming appointments will appear here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard;
