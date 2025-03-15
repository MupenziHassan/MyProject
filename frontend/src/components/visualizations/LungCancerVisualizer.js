import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const LungCancerVisualizer = ({ prediction, patientData }) => {
  const [activeView, setActiveView] = useState('risk');
  
  // Format probability as percentage
  const probabilityPercentage = (prediction.probability * 100).toFixed(1);
  
  // Get appropriate risk colors
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return { main: '#4caf50', light: 'rgba(76, 175, 80, 0.2)' };
      case 'moderate': return { main: '#ff9800', light: 'rgba(255, 152, 0, 0.2)' };
      case 'high': return { main: '#f44336', light: 'rgba(244, 67, 54, 0.2)' };
      case 'very high': return { main: '#9c27b0', light: 'rgba(156, 39, 176, 0.2)' };
      default: return { main: '#9e9e9e', light: 'rgba(158, 158, 158, 0.2)' };
    }
  };
  
  const riskColor = getRiskColor(prediction.riskLevel);
  
  // Main risk pie chart data
  const riskPieData = {
    labels: ['Risk', 'Safe'],
    datasets: [
      {
        data: [probabilityPercentage, 100 - probabilityPercentage],
        backgroundColor: [riskColor.main, '#e0e0e0'],
        borderWidth: 0
      }
    ]
  };
  
  // Extract smoking history if available
  const smokingHistory = patientData?.lifestyle?.smokingStatus || 'unknown';
  const smokingYears = patientData?.lifestyle?.smokingHistory || 0;
  
  // Lung cancer specific factors bar chart
  const factorsBarData = {
    labels: ['Smoking History', 'Age', 'Family History', 'Environmental Exposure', 'Genetic Factors', 'Previous Lung Disease'],
    datasets: [
      {
        label: 'Impact on Risk (%)',
        data: [
          prediction.factors.find(f => f.name === 'Smoking History')?.weight * 100 || 0,
          prediction.factors.find(f => f.name === 'Age')?.weight * 100 || 0,
          prediction.factors.find(f => f.name === 'Family History')?.weight * 100 || 0,
          prediction.factors.find(f => f.name === 'Environmental Exposure')?.weight * 100 || 0,
          prediction.factors.find(f => f.name === 'Genetic Factors')?.weight * 100 || 0,
          prediction.factors.find(f => f.name === 'Previous Lung Disease')?.weight * 100 || 0
        ],
        backgroundColor: [
          smokingHistory === 'never' ? '#4caf50' : smokingHistory === 'former' ? '#ff9800' : '#f44336',
          '#2196f3',
          '#9c27b0',
          '#607d8b',
          '#ff5722',
          '#795548'
        ]
      }
    ]
  };

  return (
    <div className="lung-cancer-visualizer">
      <div className="visualizer-header" style={{ backgroundColor: riskColor.light, borderLeft: `4px solid ${riskColor.main}` }}>
        <div className="header-content">
          <h3>Lung Cancer Risk Assessment</h3>
          <div className="risk-badge" style={{ backgroundColor: riskColor.main }}>
            {prediction.riskLevel.toUpperCase()} RISK
          </div>
        </div>
        <p className="risk-summary">
          Your current risk estimate is <strong>{probabilityPercentage}%</strong>
        </p>
      </div>
      
      <div className="view-tabs">
        <button 
          className={`tab-button ${activeView === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveView('risk')}
        >
          <i className="fas fa-chart-pie"></i> Risk Overview
        </button>
        <button 
          className={`tab-button ${activeView === 'factors' ? 'active' : ''}`}
          onClick={() => setActiveView('factors')}
        >
          <i className="fas fa-list"></i> Risk Factors
        </button>
        <button 
          className={`tab-button ${activeView === 'screening' ? 'active' : ''}`}
          onClick={() => setActiveView('screening')}
        >
          <i className="fas fa-stethoscope"></i> Screening Plan
        </button>
      </div>
      
      <div className="view-content">
        {activeView === 'risk' && (
          <div className="risk-view">
            <div className="risk-visualization">
              <div className="chart-container">
                <Pie 
                  data={riskPieData}
                  options={{
                    plugins: {
                      legend: { display: false }
                    },
                    cutout: '70%'
                  }}
                />
                <div className="center-text">
                  <span className="risk-percentage">{probabilityPercentage}%</span>
                </div>
              </div>
            </div>
            
            <div className="risk-context">
              <div className={`smoking-status smoking-${smokingHistory}`}>
                <h4>Smoking Status: {smokingHistory}</h4>
                {smokingHistory === 'current' && (
                  <div className="smoking-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>Your current smoking status significantly increases your lung cancer risk.</p>
                  </div>
                )}
                {smokingHistory === 'former' && (
                  <div className="smoking-info">
                    <i className="fas fa-info-circle"></i>
                    <p>Former smokers continue to have elevated risk, but it decreases over time.</p>
                    {smokingYears > 0 && (
                      <p>Your smoking history: <strong>{smokingYears} pack years</strong></p>
                    )}
                  </div>
                )}
                {smokingHistory === 'never' && (
                  <div className="smoking-positive">
                    <i className="fas fa-check-circle"></i>
                    <p>Your non-smoking status is a significant protective factor.</p>
                  </div>
                )}
              </div>
              
              <div className="risk-comparison">
                <h4>How Your Risk Compares</h4>
                <div className="comparison-item">
                  <div className="comparison-label">Your Risk:</div>
                  <div className="comparison-bar-container">
                    <div 
                      className="comparison-bar your-risk"
                      style={{ width: `${probabilityPercentage}%`, backgroundColor: riskColor.main }}
                    ></div>
                    <span>{probabilityPercentage}%</span>
                  </div>
                </div>
                <div className="comparison-item">
                  <div className="comparison-label">Average Risk (Your Age):</div>
                  <div className="comparison-bar-container">
                    <div className="comparison-bar average-risk" style={{ width: '6.5%' }}></div>
                    <span>6.5%</span>
                  </div>
                </div>
                <div className="comparison-item">
                  <div className="comparison-label">Lifetime Risk (General):</div>
                  <div className="comparison-bar-container">
                    <div className="comparison-bar lifetime-risk" style={{ width: '6%' }}></div>
                    <span>6.0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'factors' && (
          <div className="factors-view">
            <div className="factors-chart">
              <h4>Risk Factors Impact</h4>
              <Bar 
                data={factorsBarData}
                options={{
                  indexAxis: 'y',
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Impact on Risk (%)'
                      }
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
            
            <div className="modifiable-factors">
              <h4>Modifiable Risk Factors</h4>
              <div className="factors-grid">
                <div className="factor-card">
                  <div className="factor-icon">
                    <i className="fas fa-smoking"></i>
                  </div>
                  <div className="factor-content">
                    <h5>Smoking</h5>
                    <p>Quitting smoking can significantly reduce your lung cancer risk over time.</p>
                    {smokingHistory === 'current' && (
                      <div className="action-link">
                        <a href="#">Smoking Cessation Resources</a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="factor-card">
                  <div className="factor-icon">
                    <i className="fas fa-industry"></i>
                  </div>
                  <div className="factor-content">
                    <h5>Environmental Exposure</h5>
                    <p>Minimize exposure to radon, asbestos, and air pollution when possible.</p>
                    <div className="action-link">
                      <a href="#">Home Radon Testing Info</a>
                    </div>
                  </div>
                </div>
                
                <div className="factor-card">
                  <div className="factor-icon">
                    <i className="fas fa-utensils"></i>
                  </div>
                  <div className="factor-content">
                    <h5>Diet & Exercise</h5>
                    <p>A healthy diet rich in fruits and vegetables may provide some protection.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'screening' && (
          <div className="screening-view">
            <div className="screening-recommendations">
              <h4>Screening Recommendations</h4>
              
              {(smokingHistory === 'current' || smokingHistory === 'former') && smokingYears >= 20 ? (
                <div className="recommendation-alert">
                  <div className="alert-icon">
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <div className="alert-content">
                    <h5>Low-Dose CT Scan Recommended</h5>
                    <p>Based on your smoking history and risk factors, you should consider annual low-dose CT screening.</p>
                    <ul className="eligibility-criteria">
                      <li>Age 50-80 years</li>
                      <li>20+ pack-year smoking history</li>
                      <li>Current smoker or quit within past 15 years</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="recommendation-standard">
                  <p>Based on your current risk profile, routine screening is not currently recommended.</p>
                  <p>Continue with regular health check-ups and report any concerning symptoms to your healthcare provider.</p>
                </div>
              )}
            </div>
            
            <div className="warning-signs">
              <h4>Warning Signs to Watch For</h4>
              <ul className="warning-list">
                <li>Persistent cough that worsens over time</li>
                <li>Chest pain that is often worse with deep breathing</li>
                <li>Hoarseness of voice</li>
                <li>Weight loss and loss of appetite</li>
                <li>Coughing up blood or rust-colored sputum</li>
                <li>Shortness of breath</li>
                <li>Recurrent infections like bronchitis or pneumonia</li>
              </ul>
              <div className="contact-doctor">
                <p><strong>Contact your healthcare provider if you experience any of these symptoms.</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LungCancerVisualizer;
