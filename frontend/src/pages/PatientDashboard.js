import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate import
import { AuthContext } from '../contexts/AuthContext';
import apiService from '../utils/apiConfig';
import '../styles/Dashboard.css';
import { Icon } from '../utils/IconFallbacks';

// Try to import icons directly, with fallback handling
let iconComponents = {};
try {
  iconComponents = require('react-icons/fa');
} catch (err) {
  console.warn('react-icons/fa not available, using fallbacks');
}

const PatientDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate(); // Add navigate hook
  const [stats, setStats] = useState({
    appointments: 0,
    predictions: 0,
    notifications: 0,
    healthScore: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState({
    bloodPressure: [],
    bloodSugar: [],
    heartRate: [],
    weight: []
  });
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('bloodPressure');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Use the enhanced API service with proper error handling
        const statsResponse = await apiService.request(() => 
          apiService.patients.getStats()
        );

        if (statsResponse.success) {
          setStats(statsResponse.data);
        } else {
          console.error('Error fetching stats:', statsResponse.error);
        }
        
        // Fetch appointments
        const appointmentsResponse = await apiService.request(() => 
          apiService.patients.getAppointments({ limit: 5 })
        );
        
        if (appointmentsResponse.success) {
          setAppointments(appointmentsResponse.data.appointments);
        } else {
          console.error('Error fetching appointments:', appointmentsResponse.error);
        }
        
        // Fetch assessments (previously called predictions)
        const assessmentsResponse = await apiService.request(() => 
          apiService.patients.getAssessments({ limit: 5 })
        );
        
        if (assessmentsResponse.success) {
          setPredictions(assessmentsResponse.data.assessments);
        } else {
          console.error('Error fetching assessments:', assessmentsResponse.error);
        }
        
        // Fetch medications
        const medicationsResponse = await apiService.request(() => 
          apiService.patients.getMedications()
        );
        
        if (medicationsResponse.success) {
          setMedications(medicationsResponse.data.medications);
        } else {
          console.error('Error fetching medications:', medicationsResponse.error);
          setMedications([]);
        }
        
        // Fetch health metrics
        const metricsResponse = await apiService.request(() => 
          apiService.patients.getHealthMetrics()
        );
        
        if (metricsResponse.success) {
          setHealthMetrics(metricsResponse.data);
        } else {
          console.error('Error fetching health metrics:', metricsResponse.error);
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Function to mark medication as taken
  const handleMarkMedicationTaken = async (medicationId) => {
    try {
      const response = await apiService.request(() => 
        apiService.patients.updateMedicationStatus(medicationId, { taken: true, takenAt: new Date() })
      );
      
      if (response.success) {
        // Update local state to reflect the change
        setMedications(prev => 
          prev.map(med => 
            med._id === medicationId 
              ? { ...med, daysTracked: med.daysTracked + 1, lastTaken: new Date() } 
              : med
          )
        );
      } else {
        console.error('Failed to update medication status:', response.error);
      }
    } catch (err) {
      console.error('Medication update error:', err);
    }
  };
  
  // Function to handle adding new health metric
  const handleAddHealthMetric = (type) => {
    navigate(`/patient/health-metrics/add?type=${type}`); // Use navigate instead of global history
  };
  
  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Patient Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {currentUser?.name || 'Patient'}
          </p>
        </div>
        <div className="last-login">
          <Icon name="FaClock" size={16} /> Last login: {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Icon name="FaCalendarCheck" size={24} />
          </div>
          <div className="stat-value">{stats.appointments}</div>
          <div className="stat-label">Appointments</div>
          <div className="stat-change positive">
            +2 upcoming
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <Icon name="FaUserMd" size={24} />
          </div>
          <div className="stat-value">{stats.predictions}</div>
          <div className="stat-label">Doctor Assessments</div>
          <div className="stat-change">
            Last updated 2 days ago
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <Icon name="FaBell" size={24} />
          </div>
          <div className="stat-value">{stats.notifications}</div>
          <div className="stat-label">Notifications</div>
          <div className="stat-change">
            {stats.notifications > 0 ? 'New messages' : 'No new messages'}
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">
            <Icon name="FaHeartbeat" size={24} />
          </div>
          <div className="stat-value">{stats.healthScore}</div>
          <div className="stat-label">Health Score</div>
          <div className="stat-change positive">
            +5 from last month
          </div>
        </div>
      </div>

      {/* Rwanda-contextualized Quick Actions Section */}
      <div className="quick-actions-panel">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/patient/appointments/schedule" className="quick-action-card">
            <div className="quick-action-icon appointment">
              <Icon name="FaCalendarPlus" size={28} />
            </div>
            <div className="quick-action-content">
              <h3>Schedule Appointment</h3>
              <p>Book a new appointment with your doctor</p>
            </div>
            <div className="quick-action-arrow">
              <Icon name="FaChevronRight" size={16} />
            </div>
          </Link>

          <Link to="/patient/health-data/upload" className="quick-action-card">
            <div className="quick-action-icon health-check">
              <Icon name="FaNotesMedical" size={28} />
            </div>
            <div className="quick-action-content">
              <h3>Submit Health Information</h3>
              <p>Provide information for your doctor's review</p>
            </div>
            <div className="quick-action-arrow">
              <Icon name="FaChevronRight" size={16} />
            </div>
          </Link>

          <Link to="/patient/medications/refill" className="quick-action-card">
            <div className="quick-action-icon medication">
              <Icon name="FaPrescriptionBottleAlt" size={28} />
            </div>
            <div className="quick-action-content">
              <h3>Medication Refill</h3>
              <p>Request a refill for your prescriptions</p>
            </div>
            <div className="quick-action-arrow">
              <Icon name="FaChevronRight" size={16} />
            </div>
          </Link>

          <Link to="/patient/messages/new" className="quick-action-card">
            <div className="quick-action-icon message">
              <Icon name="FaUserMd" size={28} />
            </div>
            <div className="quick-action-content">
              <h3>Message Doctor</h3>
              <p>Send a message to your healthcare provider</p>
            </div>
            <div className="quick-action-arrow">
              <Icon name="FaChevronRight" size={16} />
            </div>
          </Link>
          
          <Link to="/patient/health-metrics/add" className="quick-action-card">
            <div className="quick-action-icon metrics">
              <Icon name="FaChartLine" size={28} />
            </div>
            <div className="quick-action-content">
              <h3>Log Health Data</h3>
              <p>Record information for your next check-up</p>
            </div>
            <div className="quick-action-arrow">
              <Icon name="FaChevronRight" size={16} />
            </div>
          </Link>
          
          <Link to="/patient/health-education" className="quick-action-card">
            <div className="quick-action-icon education">
              <Icon name="FaBookMedical" size={28} />
            </div>
            <div className="quick-action-content">
              <h3>Health Education</h3>
              <p>Access doctor-approved health information</p>
            </div>
            <div className="quick-action-arrow">
              <Icon name="FaChevronRight" size={16} />
            </div>
          </Link>
        </div>
      </div>
      
      <div className="content-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Upcoming Appointments</h2>
            <button className="btn btn-sm btn-outline-primary">View All</button>
          </div>
          <div className="dashboard-card-body">
            {appointments.length > 0 ? (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{new Date(appointment.dateTime).toLocaleString()}</td>
                      <td>Dr. {appointment.doctor.name}</td>
                      <td>
                        <span className={`status-badge ${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No upcoming appointments</p>
                <button className="btn btn-primary">Schedule Now</button>
              </div>
            )}
          </div>
          <div className="dashboard-card-footer">
            <a href="/patient/appointments">Manage appointments →</a>
          </div>
        </div>
        
        {/* Modified to show doctor-verified predictions */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Doctor's Health Assessments</h2>
            <button className="btn btn-sm btn-outline-primary">View All</button>
          </div>
          <div className="dashboard-card-body">
            {predictions.length > 0 ? (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Assessment Type</th>
                    <th>Result</th>
                    <th>Verified By</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((prediction) => (
                    <tr key={prediction._id}>
                      <td>{new Date(prediction.createdAt).toLocaleDateString()}</td>
                      <td>{prediction.predictionType}</td>
                      <td>
                        <span className={`status-badge ${prediction.result === 'Normal' ? 'active' : 'critical'}`}>
                          {prediction.result}
                        </span>
                      </td>
                      <td>
                        <div className="doctor-verified">
                          <Icon name="FaUserMd" size={14} /> Dr. {prediction.doctor?.name || 'Medical Team'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No health assessments available yet</p>
                <button className="btn btn-primary">Schedule a Check-up</button>
              </div>
            )}
          </div>
          <div className="dashboard-card-footer">
            <a href="/patient/doctor-assessments">View all doctor's assessments →</a>
          </div>
        </div>
      </div>
      
      {/* New Medication Tracker Section */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="dashboard-card-title">Medication Tracker</h2>
          <Link to="/patient/medications" className="btn btn-sm btn-outline-primary">Manage Medications</Link>
        </div>
        <div className="dashboard-card-body">
          {medications.length > 0 ? (
            <div className="medications-list">
              {medications.map((medication) => (
                <div key={medication._id} className="medication-item">
                  <div className="medication-info">
                    <h4>{medication.name}</h4>
                    <p>{medication.dosage} - {medication.frequency}</p>
                  </div>
                  <div className="medication-status">
                    <div className="dosage-tracker">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`dosage-day ${i < medication.daysTracked ? 'taken' : ''}`} 
                          title={`Day ${i+1}`}
                        />
                      ))}
                    </div>
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleMarkMedicationTaken(medication._id)}
                      disabled={medication.lastTaken && 
                        new Date().toDateString() === new Date(medication.lastTaken).toDateString()}
                    >
                      {medication.lastTaken && 
                        new Date().toDateString() === new Date(medication.lastTaken).toDateString() 
                        ? 'Taken Today' 
                        : 'Mark as Taken'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No medications to track</p>
              <Link to="/patient/medications/add" className="btn btn-primary">Add Medication</Link>
            </div>
          )}
        </div>
      </div>
      
      {/* New Health Metrics Section - Modified to emphasize doctor guidance */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="dashboard-card-title">My Health Metrics</h2>
          <div className="doctor-guidance-badge">
            <Icon name="FaStethoscope" size={16} /> Monitored by your doctor
          </div>
        </div>
        <div className="dashboard-card-body">
          <div className="metrics-guidance-note">
            <Icon name="FaInfoCircle" size={16} /> 
            <p>These metrics help your doctor track your health between visits. Please update regularly as instructed by your healthcare provider.</p>
          </div>
          <div className="metric-selector">
            {['bloodPressure', 'bloodSugar', 'heartRate', 'weight'].map(metric => (
              <button 
                key={metric}
                className={`btn btn-sm btn-outline-primary ${activeMetric === metric ? 'active' : ''}`}
                onClick={() => setActiveMetric(metric)}
              >
                {metric === 'bloodPressure' ? 'Blood Pressure' : 
                 metric === 'bloodSugar' ? 'Blood Sugar' : 
                 metric === 'heartRate' ? 'Heart Rate' : 'Weight'}
              </button>
            ))}
          </div>
          <div className="metrics-chart-container">
            {healthMetrics[activeMetric] && healthMetrics[activeMetric].length > 0 ? (
              <div className="metrics-chart">
                {/* In a real implementation, use a proper charting library like Chart.js */}
                {/* This is just a placeholder */}
                <div className="chart-placeholder">
                  <p>Chart visualization for {activeMetric}</p>
                  <div className="mock-chart">
                    {healthMetrics[activeMetric].slice(0, 7).map((metric, i) => (
                      <div 
                        key={i} 
                        className="chart-bar" 
                        style={{
                          height: `${Math.min((metric.value / metric.maxNormal) * 100, 100)}%`
                        }}
                        title={`${new Date(metric.date).toLocaleDateString()}: ${metric.value}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No {activeMetric} metrics recorded yet</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleAddHealthMetric(activeMetric)}
                >
                  Record {activeMetric}
                </button>
              </div>
            )}
          </div>
          {healthMetrics[activeMetric] && healthMetrics[activeMetric].length > 0 && (
            <div className="metrics-summary">
              <div className="metric-summary-item">
                <div className="metric-label">Latest</div>
                <div className="metric-value">
                  {activeMetric === 'bloodPressure' 
                    ? `${healthMetrics[activeMetric][0].systolic}/${healthMetrics[activeMetric][0].diastolic}` 
                    : healthMetrics[activeMetric][0].value + (
                        activeMetric === 'bloodSugar' ? ' mg/dL' : 
                        activeMetric === 'heartRate' ? ' bpm' : 
                        activeMetric === 'weight' ? ' kg' : ''
                      )
                  }
                </div>
              </div>
              <div className="metric-summary-item">
                <div className="metric-label">Average</div>
                <div className="metric-value">
                  {activeMetric === 'bloodPressure' 
                    ? calculateAverageBloodPressure(healthMetrics[activeMetric])
                    : calculateAverage(healthMetrics[activeMetric]) + (
                        activeMetric === 'bloodSugar' ? ' mg/dL' : 
                        activeMetric === 'heartRate' ? ' bpm' : 
                        activeMetric === 'weight' ? ' kg' : ''
                      )
                  }
                </div>
              </div>
              <div className="metric-summary-item">
                <div className="metric-label">Doctor's Note</div>
                <div className={`metric-value ${getMetricStatus(healthMetrics[activeMetric][0], activeMetric)}`}>
                  {getMetricStatusText(healthMetrics[activeMetric][0], activeMetric)}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="dashboard-card-footer">
          <Link to="/patient/health-metrics" className="dashboard-link">Record new measurements →</Link>
        </div>
      </div>
      
      {/* Add a new Community Health Services section - Rwanda specific */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="dashboard-card-title">Community Health Services</h2>
        </div>
        <div className="dashboard-card-body">
          <div className="community-services-grid">
            <div className="community-service-item">
              <div className="service-icon mutuelle">
                <Icon name="FaIdCard" size={24} />
              </div>
              <div className="service-content">
                <h4>Mutuelle de Santé</h4>
                <p>Check your health insurance status and coverage</p>
                <div className="service-status valid">Active through December 2023</div>
              </div>
            </div>
            
            <div className="community-service-item">
              <div className="service-icon chw">
                <Icon name="FaUsers" size={24} />
              </div>
              <div className="service-content">
                <h4>Community Health Worker</h4>
                <p>Connect with your local community health worker</p>
                <div className="service-contact">Kubwimana Jean Marie - 078 XXX XXX</div>
              </div>
            </div>
            
            <div className="community-service-item">
              <div className="service-icon screening">
                <Icon name="FaCalendarDay" size={24} />
              </div>
              <div className="service-content">
                <h4>Community Screening Days</h4>
                <p>Free health screenings in your sector</p>
                <div className="service-date">Next: August 15, 2023 at Kimisagara Health Center</div>
              </div>
            </div>
            
            <div className="community-service-item">
              <div className="service-icon hotline">
                <Icon name="FaPhone" size={24} />
              </div>
              <div className="service-content">
                <h4>Health Advice Hotline</h4>
                <p>24/7 medical advice by phone</p>
                <div className="service-phone">114</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for metrics
const calculateAverage = (metrics) => {
  if (!metrics || metrics.length === 0) return '0';
  const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
  return (sum / metrics.length).toFixed(1);
};

const calculateAverageBloodPressure = (metrics) => {
  if (!metrics || metrics.length === 0) return '0/0';
  const sumSystolic = metrics.reduce((acc, metric) => acc + metric.systolic, 0);
  const sumDiastolic = metrics.reduce((acc, metric) => acc + metric.diastolic, 0);
  const avgSystolic = Math.round(sumSystolic / metrics.length);
  const avgDiastolic = Math.round(sumDiastolic / metrics.length);
  return `${avgSystolic}/${avgDiastolic}`;
};

const getMetricStatus = (metric, metricType) => {
  if (!metric) return 'normal';
  
  switch (metricType) {
    case 'bloodPressure':
      if (metric.systolic >= 140 || metric.diastolic >= 90) return 'critical';
      if (metric.systolic >= 120 || metric.diastolic >= 80) return 'warning';
      return 'normal';
    case 'bloodSugar':
      if (metric.value >= 200) return 'critical';
      if (metric.value >= 140) return 'warning';
      return 'normal';
    case 'heartRate':
      if (metric.value >= 100 || metric.value <= 50) return 'critical';
      if (metric.value >= 90 || metric.value <= 60) return 'warning';
      return 'normal';
    case 'weight':
      // This would typically be based on BMI calculations
      // We're using a simplified approach here
      if (metric.value > metric.maxNormal * 1.2 || metric.value < metric.minNormal * 0.8) return 'critical';
      if (metric.value > metric.maxNormal || metric.value < metric.minNormal) return 'warning';
      return 'normal';
    default:
      return 'normal';
  }
};

const getMetricStatusText = (metric, metricType) => {
  if (!metric) return 'No data available';
  
  const status = getMetricStatus(metric, metricType);
  
  switch (status) {
    case 'critical':
      return 'Requires attention';
    case 'warning':
      return 'Monitoring advised';
    case 'normal':
      return 'Within normal range';
    default:
      return 'Status unknown';
  }
};

export default PatientDashboard;