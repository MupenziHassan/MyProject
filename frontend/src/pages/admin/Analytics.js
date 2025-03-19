import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Bar, Line, Pie } from 'react-chartjs-2';
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await api.get('/api/v1/admin/analytics');
        setAnalyticsData(response.data);
      } catch (error) {
        console.log('Using mock analytics data');
        // Mock data for presentation
        setAnalyticsData({
          userStats: {
            totalUsers: 120,
            newUsers: [10, 15, 7, 12, 8, 14],
            userTypes: {
              patients: 95,
              doctors: 20,
              admins: 5
            }
          },
          assessmentStats: {
            totalAssessments: 430,
            monthlyAssessments: [35, 42, 38, 47, 50, 56],
            riskLevels: {
              low: 280,
              moderate: 120,
              high: 30
            }
          },
          appointmentStats: {
            totalAppointments: 240,
            monthlyAppointments: [28, 32, 25, 38, 42, 45],
            status: {
              completed: 180,
              upcoming: 45,
              cancelled: 15
            }
          },
          cancerTypeStats: {
            breast: 32,
            lung: 28,
            colorectal: 18,
            prostate: 24,
            skin: 20,
            other: 8
          },
          months: ['January', 'February', 'March', 'April', 'May', 'June']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading analytics data...</p>
      </Container>
    );
  }

  // User distribution chart data
  const userDistributionData = {
    labels: ['Patients', 'Doctors', 'Administrators'],
    datasets: [
      {
        data: [
          analyticsData.userStats.userTypes.patients,
          analyticsData.userStats.userTypes.doctors, 
          analyticsData.userStats.userTypes.admins
        ],
        backgroundColor: ['#4e73df', '#1cc88a', '#e74a3b'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#c13a2f'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }
    ]
  };

  // Monthly assessments chart data
  const monthlyAssessmentsData = {
    labels: analyticsData.months,
    datasets: [
      {
        label: 'Cancer Risk Assessments',
        data: analyticsData.assessmentStats.monthlyAssessments,
        backgroundColor: 'rgba(78, 115, 223, 0.05)',
        borderColor: 'rgba(78, 115, 223, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(78, 115, 223, 1)',
        lineTension: 0.3
      }
    ]
  };

  // Risk level distribution
  const riskLevelData = {
    labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
    datasets: [
      {
        data: [
          analyticsData.assessmentStats.riskLevels.low,
          analyticsData.assessmentStats.riskLevels.moderate, 
          analyticsData.assessmentStats.riskLevels.high
        ],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      }
    ]
  };

  // Cancer type statistics
  const cancerTypeData = {
    labels: ['Breast', 'Lung', 'Colorectal', 'Prostate', 'Skin', 'Other'],
    datasets: [
      {
        label: 'Cancer Type Distribution',
        data: [
          analyticsData.cancerTypeStats.breast,
          analyticsData.cancerTypeStats.lung,
          analyticsData.cancerTypeStats.colorectal,
          analyticsData.cancerTypeStats.prostate,
          analyticsData.cancerTypeStats.skin,
          analyticsData.cancerTypeStats.other
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Monthly appointments data
  const appointmentData = {
    labels: analyticsData.months,
    datasets: [
      {
        label: 'Appointments',
        data: analyticsData.appointmentStats.monthlyAppointments,
        backgroundColor: 'rgba(28, 200, 138, 0.7)'
      }
    ]
  };

  return (
    <Container fluid className="py-4">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Insights and statistics for Ubumuntu Cancer Prediction System"
      />

      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">User Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie 
                  data={userDistributionData}
                  options={{ 
                    maintainAspectRatio: false, 
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
              <div className="text-center mt-4">
                <span className="me-3">
                  <strong>Total Users:</strong> {analyticsData.userStats.totalUsers}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Risk Assessment Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie 
                  data={riskLevelData}
                  options={{ 
                    maintainAspectRatio: false, 
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
              <div className="text-center mt-4">
                <span className="me-3">
                  <strong>Total Assessments:</strong> {analyticsData.assessmentStats.totalAssessments}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Monthly Assessment Trends</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Line 
                  data={monthlyAssessmentsData}
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Monthly Appointments</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Bar 
                  data={appointmentData}
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={5}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Cancer Type Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Bar 
                  data={cancerTypeData}
                  options={{ 
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      y: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
