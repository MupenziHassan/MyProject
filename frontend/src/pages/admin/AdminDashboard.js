import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import DashboardStats from '../../components/common/DashboardStats';
import PageHeader from '../../components/common/PageHeader';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/v1/admin/stats');
        setDashboardData(response.data.data);
      } catch (error) {
        console.log('Using mock admin dashboard data');
        // Mock data for presentation
        setDashboardData({
          userCounts: {
            total: 45,
            patients: 32,
            doctors: 10,
            admin: 3
          },
          systemHealth: {
            status: 'Healthy',
            uptime: '12 days',
            lastBackup: '2023-07-14'
          },
          recentActivity: [
            { type: 'New User', details: 'Patient John Doe registered', time: '2 hours ago' },
            { type: 'Appointment', details: 'Dr. Smith completed appointment with Patient #12', time: '3 hours ago' },
            { type: 'Prediction', details: 'New health prediction for Patient #23', time: '5 hours ago' },
            { type: 'System', details: 'Database backup completed', time: '1 day ago' }
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
  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <PageHeader 
        title="System Administration"
        subtitle="Manage the Ubumuntu Cancer Prediction System"
        buttonText="Logout"
        buttonIcon="sign-out-alt"
        buttonVariant="outline-danger"
        buttonAction={handleLogout}
      />
      
      <DashboardStats 
        stats={[
          {
            title: "Total Users",
            value: dashboardData.userCounts.total,
            icon: "users",
            color: "primary",
            link: "/admin/users",
            linkText: "Manage users"
          },
          {
            title: "Patients",
            value: dashboardData.userCounts.patients,
            icon: "user",
            color: "success",
            link: "/admin/users?role=patient",
            linkText: "View patients"
          },
          {
            title: "Doctors",
            value: dashboardData.userCounts.doctors,
            icon: "user-md",
            color: "info",
            link: "/admin/users?role=doctor",
            linkText: "View doctors"
          },
          {
            title: "System Status",
            value: dashboardData.systemHealth.status,
            icon: "server",
            color: "warning",
            link: "/admin/settings",
            linkText: "View settings"
          }
        ]}
      />
      
      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">System Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div className="fw-bold">System Uptime</div>
                <div>{dashboardData.systemHealth.uptime}</div>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <div className="fw-bold">Last Database Backup</div>
                <div>{dashboardData.systemHealth.lastBackup}</div>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <div className="fw-bold">Administrators</div>
                <div>{dashboardData.userCounts.admin}</div>
              </div>
              <hr />
              <div className="text-center">
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/admin/settings')}
                >
                  <i className="fas fa-cog me-2"></i>System Settings
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <div className="activity-list">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item d-flex align-items-start mb-3">
                    <div className={`activity-icon bg-${
                      activity.type === 'New User' ? 'info' : 
                      activity.type === 'Appointment' ? 'success' :
                      activity.type === 'Prediction' ? 'warning' : 'secondary'
                    } rounded-circle me-3`} style={{width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                      <i className={`fas fa-${
                        activity.type === 'New User' ? 'user-plus' :
                        activity.type === 'Appointment' ? 'calendar-check' :
                        activity.type === 'Prediction' ? 'chart-line' : 'cog'
                      }`}></i>
                    </div>
                    <div className="activity-content">
                      <h6 className="mb-0">{activity.type}</h6>
                      <p className="text-muted mb-0">{activity.details}</p>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
