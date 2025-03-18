import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

const PatientDashboard = () => {
  const { auth } = useContext(AuthContext);
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
        // Use mock data for presentation
        setDashboardData({
          upcomingAppointments: [
            { id: 'appt1', doctorName: 'Dr. Smith', specialization: 'Cardiologist', date: '2023-07-15T10:30:00', status: 'confirmed' },
            { id: 'appt2', doctorName: 'Dr. Johnson', specialization: 'Neurologist', date: '2023-07-22T14:00:00', status: 'pending' }
          ],
          recentHealthMetrics: {
            bloodPressure: { value: '120/80', date: '2023-07-01', status: 'normal' },
            heartRate: { value: '72', date: '2023-07-01', status: 'normal' },
            bloodSugar: { value: '95', date: '2023-07-01', status: 'normal' },
            bmi: { value: '24.5', date: '2023-06-15', status: 'normal' }
          },
          predictionsCount: 5,
          completedAppointmentsCount: 8
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
  
  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Welcome, {auth.user?.name || 'Patient'}!</h2>
          <p className="text-muted">Your health dashboard overview</p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/patient/health-assessment')}
          >
            <i className="fas fa-plus-circle me-2"></i>
            New Health Assessment
          </Button>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="dashboard-stat-card bg-primary text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2">Health Assessments</h6>
                  <h2 className="mb-0">{dashboardData.predictionsCount}</h2>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-heartbeat fa-3x opacity-50"></i>
                </div>
              </div>
              <Link to="/patient/health-assessment" className="text-white stretched-link mt-3 d-block">
                <small>View assessments <i className="fas fa-arrow-right ms-1"></i></small>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="dashboard-stat-card bg-success text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2">Appointments</h6>
                  <h2 className="mb-0">{dashboardData.completedAppointmentsCount}</h2>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-calendar-check fa-3x opacity-50"></i>
                </div>
              </div>
              <Link to="/patient/appointments" className="text-white stretched-link mt-3 d-block">
                <small>Manage appointments <i className="fas fa-arrow-right ms-1"></i></small>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="dashboard-stat-card bg-info text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2">Heart Rate</h6>
                  <h2 className="mb-0">
                    {dashboardData.recentHealthMetrics.heartRate.value}
                    <small> bpm</small>
                  </h2>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-heart fa-3x opacity-50"></i>
                </div>
              </div>
              <p className="mt-3 mb-0">
                <small>Last updated: {new Date(dashboardData.recentHealthMetrics.heartRate.date).toLocaleDateString()}</small>
              </p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="dashboard-stat-card bg-warning text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2">Blood Pressure</h6>
                  <h2 className="mb-0">
                    {dashboardData.recentHealthMetrics.bloodPressure.value}
                  </h2>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-stethoscope fa-3x opacity-50"></i>
                </div>
              </div>
              <p className="mt-3 mb-0">
                <small>Last updated: {new Date(dashboardData.recentHealthMetrics.bloodPressure.date).toLocaleDateString()}</small>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
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
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Health Metrics</h5>
            </Card.Header>
            <Card.Body>
              <div className="health-metric mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Blood Sugar</span>
                  <span className={`badge bg-${dashboardData.recentHealthMetrics.bloodSugar.status === 'normal' ? 'success' : 'danger'}`}>
                    {dashboardData.recentHealthMetrics.bloodSugar.status}
                  </span>
                </div>
                <div className="progress">
                  <div 
                    className={`progress-bar bg-${dashboardData.recentHealthMetrics.bloodSugar.status === 'normal' ? 'success' : 'danger'}`}
                    role="progressbar" 
                    style={{ width: '70%' }}
                    aria-valuenow="70" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {dashboardData.recentHealthMetrics.bloodSugar.value} mg/dL
                  </div>
                </div>
              </div>
              
              <div className="health-metric mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>BMI</span>
                  <span className={`badge bg-${dashboardData.recentHealthMetrics.bmi.status === 'normal' ? 'success' : 'warning'}`}>
                    {dashboardData.recentHealthMetrics.bmi.status}
                  </span>
                </div>
                <div className="progress">
                  <div 
                    className={`progress-bar bg-${dashboardData.recentHealthMetrics.bmi.status === 'normal' ? 'success' : 'warning'}`}
                    role="progressbar" 
                    style={{ width: '60%' }}
                    aria-valuenow="60" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {dashboardData.recentHealthMetrics.bmi.value}
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/patient/health-assessment')}
                >
                  Start New Assessment
                </Button>
              </div>
            </Card.Body>
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
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .appointment-card {
          transition: box-shadow 0.2s ease;
        }
        .appointment-card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Container>
  );
};

export default PatientDashboard;
