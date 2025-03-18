import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import adminService from '../../services/adminService';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try to get stats from API
        const response = await adminService.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.log('Using mock stats data');
        // Mock data for presentation
        setStats({
          userCounts: {
            total: 45,
            patients: 32,
            doctors: 10,
            admin: 3
          },
          appointments: {
            total: 78,
            completed: 45,
            upcoming: 23,
            canceled: 10
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
    
    fetchStats();
  }, []);
  
  if (loading) {
    return <div>Loading statistics...</div>;
  }
  
  const userChartData = {
    labels: ['Patients', 'Doctors', 'Admins'],
    datasets: [
      {
        data: [stats.userCounts.patients, stats.userCounts.doctors, stats.userCounts.admin],
        backgroundColor: ['#4e73df', '#1cc88a', '#e74a3b'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#c13a2f'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }
    ]
  };
  
  const appointmentChartData = {
    labels: ['Completed', 'Upcoming', 'Canceled'],
    datasets: [
      {
        label: '# of Appointments',
        data: [stats.appointments.completed, stats.appointments.upcoming, stats.appointments.canceled],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div className="admin-stats">
      <h3>System Overview</h3>
      
      <Row className="mb-4">
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-primary h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.userCounts.total}</div>
                </Col>
                <Col xs="auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-success h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Appointments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.appointments.total}</div>
                </Col>
                <Col xs="auto">
                  <i className="fas fa-calendar fa-2x text-gray-300"></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-info h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Upcoming Appointments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.appointments.upcoming}</div>
                </Col>
                <Col xs="auto">
                  <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-warning h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Active Doctors
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.userCounts.doctors}</div>
                </Col>
                <Col xs="auto">
                  <i className="fas fa-user-md fa-2x text-gray-300"></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">User Distribution</h6>
            </Card.Header>
            <Card.Body>
              <div className="chart-pie">
                <Pie data={userChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Appointment Status</h6>
            </Card.Header>
            <Card.Body>
              <div className="chart-bar">
                <Bar 
                  data={appointmentChartData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
            </Card.Header>
            <Card.Body>
              <div className="activity-list">
                {stats.recentActivity.map((activity, index) => (
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
    </div>
  );
};

export default AdminStats;
