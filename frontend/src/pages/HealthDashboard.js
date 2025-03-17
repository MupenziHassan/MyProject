import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getHealthDashboard } from '../services/healthService';
import '../styles/HealthDashboard.css';

const HealthDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState({
    recentMetrics: null,
    predictions: [],
    appointments: [],
    tests: [],
    riskFactors: []
  });
  const [selectedMetric, setSelectedMetric] = useState('bloodPressure');

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        const response = await getHealthDashboard();
        if (response.success) {
          setHealthData(response.data);
        }
      } catch (err) {
        console.error('Error fetching health data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthData();
  }, []); // Only run once on component mount

  const getColorForRiskLevel = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'var(--success-color)';
      case 'moderate': return 'var(--warning-color)';
      case 'high': return 'var(--danger-color)';
      case 'very high': return 'var(--danger-dark)';
      default: return 'var(--neutral-500)';
    }
  };

  // Use navigate with replace option for better navigation management
  const handleSubmitHealthData = () => {
    navigate('/patient/health-data/submit', { replace: true });
  };

  if (loading) {
    return <div className="loading">Loading your health dashboard...</div>;
  }

  return (
    <div className="health-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Health Dashboard</h1>
          <p className="health-summary">
            Track your health metrics, upcoming appointments, and health risk assessments
          </p>
        </div>
        <div className="last-update">
          <i className="fas fa-sync-alt"></i> Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Health Metrics */}
        <div className="dashboard-card health-metrics-card">
          <div className="card-header">
            <h2>Health Metrics</h2>
            <div className="metric-selector">
              <button 
                className={selectedMetric === 'bloodPressure' ? 'active' : ''}
                onClick={() => setSelectedMetric('bloodPressure')}
              >
                Blood Pressure
              </button>
              <button 
                className={selectedMetric === 'bloodSugar' ? 'active' : ''}
                onClick={() => setSelectedMetric('bloodSugar')}
              >
                Blood Sugar
              </button>
              <button 
                className={selectedMetric === 'heartRate' ? 'active' : ''}
                onClick={() => setSelectedMetric('heartRate')}
              >
                Heart Rate
              </button>
              <button 
                className={selectedMetric === 'weight' ? 'active' : ''}
                onClick={() => setSelectedMetric('weight')}
              >
                Weight
              </button>
            </div>
          </div>

          <div className="card-content">
            {healthData.recentMetrics ? (
              <div className="metric-display">
                <div className="metric-value-container">
                  {selectedMetric === 'bloodPressure' && (
                    <div className="blood-pressure-display">
                      <div className="metric-main-value">
                        {healthData.recentMetrics.bloodPressure?.systolic || '---'}/
                        {healthData.recentMetrics.bloodPressure?.diastolic || '---'}
                      </div>
                      <div className="metric-unit">mmHg</div>
                    </div>
                  )}
                  
                  {selectedMetric === 'bloodSugar' && (
                    <div className="metric-value">
                      <div className="metric-main-value">
                        {healthData.recentMetrics.bloodSugar?.value || '---'}
                      </div>
                      <div className="metric-unit">mg/dL</div>
                    </div>
                  )}
                  
                  {selectedMetric === 'heartRate' && (
                    <div className="metric-value">
                      <div className="metric-main-value">
                        {healthData.recentMetrics.heartRate?.value || '---'}
                      </div>
                      <div className="metric-unit">bpm</div>
                    </div>
                  )}
                  
                  {selectedMetric === 'weight' && (
                    <div className="metric-value">
                      <div className="metric-main-value">
                        {healthData.recentMetrics.weight?.value || '---'}
                      </div>
                      <div className="metric-unit">kg</div>
                    </div>
                  )}
                </div>
                
                <div className="metric-history-container">
                  <div className="metric-history-chart">
                    {/* Placeholder for chart visualization */}
                    <div className="chart-placeholder">
                      <div className="chart-bars">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="chart-bar" 
                            style={{height: `${Math.random() * 60 + 20}%`}}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="metric-info">
                    <div className="metric-info-item">
                      <div className="info-label">Normal Range:</div>
                      <div className="info-value">
                        {selectedMetric === 'bloodPressure' && '90-120/60-80 mmHg'}
                        {selectedMetric === 'bloodSugar' && '70-99 mg/dL (fasting)'}
                        {selectedMetric === 'heartRate' && '60-100 bpm'}
                        {selectedMetric === 'weight' && 'BMI 18.5-24.9'}
                      </div>
                    </div>
                    
                    <div className="metric-info-item">
                      <div className="info-label">Trend:</div>
                      <div className="info-value">
                        <span className="trend-stable">
                          <i className="fas fa-equals"></i> Stable
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">
                <p>No health metrics available</p>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmitHealthData}
                >
                  Submit Health Information
                </button>
              </div>
            )}
          </div>
          
          <div className="card-footer">
            <Link to="/patient/health-data/submit" className="btn btn-outline-primary">Submit New Health Data</Link>
            <Link to="/patient/health-metrics" className="card-link">View All Metrics</Link>
          </div>
        </div>

        {/* Risk Assessments */}
        <div className="dashboard-card risk-assessment-card">
          <div className="card-header">
            <h2>Health Risk Assessments</h2>
            <Link to="/patient/risk-assessments" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          
          <div className="card-content">
            {healthData.predictions && healthData.predictions.length > 0 ? (
              <div className="risk-list">
                {healthData.predictions.slice(0, 3).map((prediction, index) => (
                  <div key={index} className="risk-item">
                    <div className="risk-info">
                      <h3>{prediction.condition}</h3>
                      <div className="risk-details">
                        <span className="detail-item">
                          <i className="fas fa-calendar"></i> 
                          {new Date(prediction.createdAt).toLocaleDateString()}
                        </span>
                        <span className="detail-item">
                          <i className="fas fa-user-md"></i> Dr. {prediction.doctor?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="risk-level-container">
                      <div 
                        className={`risk-level ${prediction.riskLevel.toLowerCase().replace(' ', '-')}`}
                        style={{ backgroundColor: getColorForRiskLevel(prediction.riskLevel) }}
                      >
                        {prediction.riskLevel}
                      </div>
                      {prediction.probability && (
                        <div className="risk-probability">
                          {Math.round(prediction.probability * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No risk assessments available</p>
                <Link to="/patient/health-assessment" className="btn btn-primary">
                  Complete Health Assessment
                </Link>
              </div>
            )}
          </div>
          
          <div className="card-footer">
            {healthData.predictions && healthData.predictions.length > 0 && (
              <Link to="/patient/appointments/schedule" className="btn btn-primary">Schedule Follow-up</Link>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-card appointments-card">
          <div className="card-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          
          <div className="card-content">
            {healthData.appointments && healthData.appointments.length > 0 ? (
              <div className="appointments-list">
                {healthData.appointments.slice(0, 3).map((appointment, index) => {
                  const appointmentDate = new Date(appointment.date);
                  return (
                    <div key={index} className="appointment-item">
                      <div className="appointment-date">
                        <div className="date-badge">
                          <span className="month">
                            {appointmentDate.toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="day">{appointmentDate.getDate()}</span>
                        </div>
                        <span className="time">
                          {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="appointment-details">
                        <h4>Dr. {appointment.doctor?.name || 'Unknown'}</h4>
                        <div className="appointment-type">
                          <span className={`type-badge ${appointment.type}`}>
                            {appointment.type === 'in-person' ? 'In-Person' : 
                             appointment.type === 'video' ? 'Video Call' : 'Phone Call'}
                          </span>
                          {appointment.location && <span className="location">{appointment.location}</span>}
                        </div>
                        <p className="reason">{appointment.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">
                <p>No upcoming appointments</p>
                <Link to="/patient/appointments/schedule" className="btn btn-primary">
                  Schedule Appointment
                </Link>
              </div>
            )}
          </div>
          
          <div className="card-footer">
            {healthData.appointments && healthData.appointments.length > 0 && (
              <Link to="/patient/appointments/schedule" className="btn btn-primary">
                Schedule New Appointment
              </Link>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="dashboard-card test-results-card">
          <div className="card-header">
            <h2>Recent Test Results</h2>
            <Link to="/patient/test-results" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          
          <div className="card-content">
            {healthData.tests && healthData.tests.length > 0 ? (
              <div className="test-results-list">
                {healthData.tests.slice(0, 3).map((test, index) => (
                  <div key={index} className="test-result-item">
                    <div className="test-info">
                      <h3>{test.name || 'Test Result'}</h3>
                      <div className="test-details">
                        <span className="detail-item">
                          <i className="fas fa-calendar"></i> 
                          {new Date(test.date).toLocaleDateString()}
                        </span>
                        <span className="detail-item">
                          <i className="fas fa-flask"></i> {test.category || 'General'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="test-status">
                      <span className={`status-indicator ${test.status.toLowerCase()}`}>
                        {test.status}
                      </span>
                      <Link to={`/patient/test-results/${test._id}`} className="view-details">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No recent test results available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Health Risk Factors */}
        <div className="dashboard-card risk-factors-card">
          <div className="card-header">
            <h2>Health Risk Factors</h2>
            <Link to="/patient/risk-factors" className="btn btn-sm btn-outline-primary">View Details</Link>
          </div>
          
          <div className="card-content">
            {healthData.riskFactors && healthData.riskFactors.length > 0 ? (
              <div className="risk-factors-container">
                <div className="risk-factors-chart">
                  {/* Placeholder for risk factors visualization */}
                  <div className="chart-placeholder">
                    <div className="risk-chart-container">
                      {healthData.riskFactors.map((factor, index) => (
                        <div 
                          key={index} 
                          className="risk-factor-bar"
                          style={{
                            width: `${Math.min(factor.level * 100, 100)}%`,
                            backgroundColor: getColorForRiskLevel(factor.severity)
                          }}
                        >
                          <span className="factor-name">{factor.name}</span>
                          <span className="factor-level">{Math.round(factor.level * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="risk-summary">
                  <div className="summary-heading">Recommended Actions:</div>
                  <ul className="action-items">
                    {healthData.riskFactors.some(f => f.severity === 'High' || f.severity === 'Very High') && (
                      <li>
                        <i className="fas fa-exclamation-circle"></i> 
                        Consult with your healthcare provider about high-risk factors
                      </li>
                    )}
                    {healthData.riskFactors.some(f => f.name.toLowerCase().includes('blood pressure')) && (
                      <li>
                        <i className="fas fa-heart"></i> 
                        Monitor blood pressure regularly
                      </li>
                    )}
                    {healthData.riskFactors.some(f => f.name.toLowerCase().includes('weight') || f.name.toLowerCase().includes('bmi')) && (
                      <li>
                        <i className="fas fa-running"></i> 
                        Maintain regular physical activity
                      </li>
                    )}
                    <li>
                      <i className="fas fa-apple-alt"></i> 
                      Follow a balanced diet
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="no-data">
                <p>No risk factor data available</p>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmitHealthData}
                >
                  Submit Health Information
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
