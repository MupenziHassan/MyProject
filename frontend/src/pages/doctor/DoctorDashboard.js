import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import DashboardStats from '../../components/common/DashboardStats';
import PageHeader from '../../components/common/PageHeader';

const DoctorDashboard = () => {
  const { auth, logout } = useContext(AuthContext);
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
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
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
        subtitle={`Welcome, Dr. ${auth?.user?.name || 'User'} - Manage your patients and appointments at Ubumuntu Clinic`}
        buttonText="Logout"
        buttonIcon="sign-out-alt"
        buttonVariant="outline-danger"
        buttonAction={handleLogout}
      />
      
      {/* Use the shared DashboardStats component */}
      <DashboardStats 
        stats={[
          {
            title: "Today's Appointments",
            value: dashboardData?.todayAppointments || 0,
            icon: 'calendar-day',
            color: 'success',
            link: '/doctor/appointments',
            linkText: 'View schedule'
          },
          {
            title: 'Pending Assessments',
            value: dashboardData?.pendingAssessments || 0,
            icon: 'clipboard-list',
            color: 'warning',
            link: '/doctor/assessments',
            linkText: 'Review assessments'
          },
          {
            title: 'Total Patients',
            value: dashboardData?.totalPatients || 0,
            icon: 'users',
            color: 'primary',
            link: '/doctor/patients',
            linkText: 'View patients'
          },
          {
            title: 'High Risk Cases',
            value: dashboardData?.highRiskPatients || 0,
            icon: 'exclamation-triangle',
            color: 'danger',
            link: '/doctor/assessments?status=high-risk',
            linkText: 'Prioritize cases'
          }
        ]}
      />
      
      <Row>
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Upcoming Appointments</h5>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => navigate('/doctor/appointments')}
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {dashboardData?.upcomingAppointments?.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-times text-muted fa-3x mb-3"></i>
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                dashboardData?.upcomingAppointments?.map(appointment => (
                  <Card 
                    key={appointment.id} 
                    className="mb-3 appointment-card border-start border-5 border-success"
                  >
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={2} className="text-center mb-3 mb-md-0">
                          <div className="appointment-date p-2 rounded bg-light">
                            <div className="day">{new Date(appointment.date).getDate()}</div>
                            <div className="month">{new Date(appointment.date).toLocaleString('default', { month: 'short' })}</div>
                            <div className="time">{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </Col>
                        <Col md={7} className="mb-3 mb-md-0">
                          <h6 className="mb-1">
                            <Link to={`/doctor/patients/${appointment.patientId}`} className="text-decoration-none">
                              {appointment.patientName}
                            </Link>
                          </h6>
                          <p className="text-muted small mb-1">
                            <i className="fas fa-info-circle me-2"></i>
                            {appointment.reason}
                          </p>
                          <Badge bg={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </Col>
                        <Col md={3} className="text-md-end">
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            className="me-2"
                            onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                          >
                            <i className="fas fa-eye me-1"></i> Details
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
            <Card.Footer className="bg-white text-center">
              <Button 
                variant="success" 
                onClick={() => navigate('/doctor/appointments')}
              >
                Manage All Appointments
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col lg={5} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Risk Assessments</h5>
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={() => navigate('/doctor/assessments')}
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {dashboardData?.recentAssessments?.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-clipboard-check text-muted fa-3x mb-3"></i>
                  <p>No recent assessments</p>
                </div>
              ) : (
                dashboardData?.recentAssessments?.map(assessment => (
                  <Card 
                    key={assessment.id} 
                    className="mb-3 assessment-card border-start border-5 border-warning"
                  >
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs={12} lg={8}>
                          <h6 className="mb-1">
                            <Link to={`/doctor/patients/${assessment.patientId}`} className="text-decoration-none">
                              {assessment.patientName}
                            </Link>
                          </h6>
                          <p className="text-muted small mb-1">
                            <i className="fas fa-calendar me-2"></i>
                            {new Date(assessment.date).toLocaleString()}
                          </p>
                          <div className="d-flex align-items-center">
                            <Badge bg={getRiskBadgeVariant(assessment.riskLevel)} className="me-2">
                              {assessment.riskLevel} risk
                            </Badge>
                            <Badge bg={getStatusBadgeVariant(assessment.status)}>
                              {assessment.status}
                            </Badge>
                          </div>
                        </Col>
                        <Col xs={12} lg={4} className="text-lg-end mt-3 mt-lg-0">
                          <Button 
                            variant={assessment.status === 'pending' ? 'warning' : 'outline-secondary'} 
                            size="sm"
                            onClick={() => navigate(`/doctor/assessments/${assessment.id}`)}
                          >
                            {assessment.status === 'pending' ? (
                              <>
                                <i className="fas fa-stethoscope me-1"></i> Review
                              </>
                            ) : (
                              <>
                                <i className="fas fa-eye me-1"></i> View
                              </>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
            <Card.Footer className="bg-white text-center">
              <Button 
                variant="warning" 
                className="me-2"
                onClick={() => navigate('/doctor/assessments?status=pending')}
              >
                Review Pending Assessments
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <style jsx="true">{`
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
        .appointment-date {
          background-color: #f8f9fa;
          border-radius: 0.5rem;
        }
        .appointment-date .day {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .appointment-date .month {
          font-size: 0.9rem;
          text-transform: uppercase;
        }
        .appointment-date .time {
          font-size: 0.9rem;
          color: #6c757d;
        }
        .appointment-card, .assessment-card {
          transition: box-shadow 0.2s;
        }
        .appointment-card:hover, .assessment-card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1);
        }
      `}</style>
    </Container>
  );
};

export default DoctorDashboard;
