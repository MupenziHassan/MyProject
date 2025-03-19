import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import DashboardStats from '../../components/common/DashboardStats';
import PageHeader from '../../components/common/PageHeader';

const PatientDashboard = () => {
  const { auth } = useContext(AuthContext); // Remove unused logout from destructuring
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Try to fetch real data
        const response = await api.get('/api/v1/patients/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.log('Using mock dashboard data');
        // Use mock data for presentation - adapted for Ubumuntu Clinic's cancer focus
        setDashboardData({
          upcomingAppointments: [
            { id: 'appt1', doctorName: 'Dr. Mugisha', specialization: 'Oncologist', date: '2023-07-15T10:30:00', status: 'confirmed' },
            { id: 'appt2', doctorName: 'Dr. Uwase', specialization: 'Radiologist', date: '2023-07-22T14:00:00', status: 'pending' }
          ],
          recentHealthMetrics: {
            riskScore: { value: '2.8', date: '2023-07-01', status: 'low' },
            bmi: { value: '24.5', date: '2023-06-15', status: 'normal' }
          },
          assessmentsCount: 3,
          completedAppointmentsCount: 5,
          cancerScreeningStatus: 'up-to-date',
          recentAssessments: [
            { date: '2023-07-01', riskLevel: 'low', riskScore: 2.8 },
            { date: '2023-06-15', riskLevel: 'moderate', riskScore: 5.4 },
            { date: '2023-05-20', riskLevel: 'high', riskScore: 8.1 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your dashboard...</p>
      </Container>
    );
  }

  // Update getRiskScoreClass to use riskScore or provide a default
  const getRiskScoreClass = () => {
    const status = dashboardData?.recentHealthMetrics?.riskScore?.status;
    if (!status) return 'success'; // default
    return status === 'low' ? 'success' : status === 'moderate' ? 'warning' : 'danger';
  };
  
  return (
    <Container className="py-4">
      <PageHeader 
        title={`Welcome, ${auth?.user?.name || 'Patient'}!`}
        subtitle="Your Ubumuntu Cancer Prediction dashboard"
        buttonText="New Assessment"
        buttonIcon="plus-circle"
        buttonVariant="primary"
        buttonAction={() => navigate('/patient/health-assessment')}
      />
      
      {/* Use the shared DashboardStats component */}
      <DashboardStats 
        stats={[
          {
            title: 'Cancer Assessments',
            value: dashboardData?.assessmentsCount || 0,
            icon: 'clipboard-check',
            color: 'primary',
            link: '/patient/health-assessment',
            linkText: 'View assessments'
          },
          {
            title: 'Appointments',
            value: dashboardData?.completedAppointmentsCount || 0,
            icon: 'calendar-check',
            color: 'success',
            link: '/patient/appointments',
            linkText: 'Manage appointments'
          },
          {
            title: 'Cancer Risk Score',
            value: dashboardData?.recentHealthMetrics?.riskScore?.value || 'N/A',
            subtitle: '/10',
            icon: 'chart-line',
            color: 'info',
            link: '/patient/health-assessment',
            linkText: 'Check details'
          },
          {
            title: 'Screening Status',
            value: dashboardData?.cancerScreeningStatus === 'up-to-date' ? 'Current' : 'Due',
            icon: 'stethoscope',
            color: 'warning',
            link: '/patient/appointments',
            linkText: 'Schedule screening'
          }
        ]}
      />
      
      <Row>
        <Col md={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Upcoming Appointments</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/patient/appointments')}
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {dashboardData.upcomingAppointments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-times text-muted fa-3x mb-3"></i>
                  <p>No upcoming appointments</p>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate('/patient/appointments/schedule')}
                  >
                    Schedule Appointment
                  </Button>
                </div>
              ) : (
                dashboardData.upcomingAppointments.map(appointment => (
                  <Card 
                    key={appointment.id} 
                    className="mb-3 appointment-card border-start border-5 border-primary"
                  >
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs={2} md={1} className="text-center">
                          <div className="avatar-circle bg-primary text-white">
                            <i className="fas fa-user-md"></i>
                          </div>
                        </Col>
                        <Col xs={10} md={4}>
                          <h6 className="mb-0">{appointment.doctorName}</h6>
                          <small className="text-muted">{appointment.specialization}</small>
                        </Col>
                        <Col md={4} className="mt-3 mt-md-0">
                          <div className="d-flex align-items-center">
                            <i className="far fa-calendar me-2 text-primary"></i>
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="far fa-clock me-2 text-primary"></i>
                            <span>{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </Col>
                        <Col xs={12} md={3} className="text-md-end mt-3 mt-md-0">
                          <span className={`badge bg-${appointment.status === 'confirmed' ? 'success' : 'warning'} mb-2 d-inline-block`}>
                            {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                          <div>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => navigate(`/patient/appointments/${appointment.id}`)}
                            >
                              Details
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Cancer Risk Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="health-metric mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Risk Score</span>
                  <span className={`badge bg-${getRiskScoreClass()}`}>
                    {dashboardData?.recentHealthMetrics?.riskScore?.status || 'Low'}
                  </span>
                </div>
                <div className="progress">
                  <div 
                    className={`progress-bar bg-${getRiskScoreClass()}`}
                    role="progressbar" 
                    style={{ width: `${Math.min((parseFloat(dashboardData?.recentHealthMetrics?.riskScore?.value || 0) / 10) * 100, 100)}%` }}
                    aria-valuenow={dashboardData?.recentHealthMetrics?.riskScore?.value || 0} 
                    aria-valuemin="0" 
                    aria-valuemax="10"
                  >
                    {dashboardData?.recentHealthMetrics?.riskScore?.value || 0}/10
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/patient/health-assessment')}
                >
                  Start New Assessment
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Assessments</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/patient/health-records')}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData?.recentAssessments && dashboardData.recentAssessments.length > 0 ? (
                <>
                  {dashboardData.recentAssessments.slice(0, 3).map((assessment, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <div className="fw-bold">
                          Cancer Risk Assessment
                        </div>
                        <div className="text-muted small">
                          {new Date(assessment.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <Badge bg={
                          assessment.riskLevel === 'low' ? 'success' :
                          assessment.riskLevel === 'moderate' ? 'warning' : 'danger'
                        } className="me-2">
                          {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)}
                        </Badge>
                        <div className="text-nowrap">
                          {assessment.riskScore}/10
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center mt-4">
                    <Button 
                      variant="primary"
                      onClick={() => navigate('/patient/health-assessment')}
                    >
                      New Assessment
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p>No recent assessments found.</p>
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/patient/health-assessment')}
                  >
                    Take Your First Assessment
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Appointments</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/patient/appointments')}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.upcomingAppointments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-times text-muted fa-3x mb-3"></i>
                  <p>No upcoming appointments</p>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate('/patient/appointments/schedule')}
                  >
                    Schedule Appointment
                  </Button>
                </div>
              ) : (
                dashboardData.upcomingAppointments.map(appointment => (
                  <Card 
                    key={appointment.id} 
                    className="mb-3 appointment-card border-start border-5 border-primary"
                  >
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs={2} md={1} className="text-center">
                          <div className="avatar-circle bg-primary text-white">
                            <i className="fas fa-user-md"></i>
                          </div>
                        </Col>
                        <Col xs={10} md={4}>
                          <h6 className="mb-0">{appointment.doctorName}</h6>
                          <small className="text-muted">{appointment.specialization}</small>
                        </Col>
                        <Col md={4} className="mt-3 mt-md-0">
                          <div className="d-flex align-items-center">
                            <i className="far fa-calendar me-2 text-primary"></i>
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="far fa-clock me-2 text-primary"></i>
                            <span>{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </Col>
                        <Col xs={12} md={3} className="text-md-end mt-3 mt-md-0">
                          <span className={`badge bg-${appointment.status === 'confirmed' ? 'success' : 'warning'} mb-2 d-inline-block`}>
                            {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                          <div>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => navigate(`/patient/appointments/${appointment.id}`)}
                            >
                              Details
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
              <div className="text-center mt-3">
                <Button 
                  variant="primary"
                  onClick={() => navigate('/patient/appointments/schedule')}
                >
                  <i className="fas fa-calendar-plus me-2"></i>
                  Schedule Appointment
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <style jsx="true">{`
        .avatar-circle {
          width: 80px;
          height: 80px;
          font-size: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dashboard-stat-card {
          border: none;
          border-radius: 0.5rem;
          transition: transform 0.2s ease;
        }
        .dashboard-stat-card:hover {
          transform: translateY(-5px);
        }
        .stat-icon {
          opacity: 0.8;
        }
      `}</style>
    </Container>
  );
};

export default PatientDashboard;
