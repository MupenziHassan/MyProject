import React, { useState } from 'react';
import { Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

const BreastCancerVisualizer = ({ prediction, patientData }) => {
  const [activeView, setActiveView] = useState('risk');
  
  // Format the probability as percentage
  const probabilityPercentage = (prediction.probability * 100).toFixed(1);
  
  // Get color based on risk level
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return { background: '#4caf50', text: '#fff' };
      case 'moderate': return { background: '#ff9800', text: '#fff' };
      case 'high': return { background: '#f44336', text: '#fff' };
      case 'very high': return { background: '#9c27b0', text: '#fff' };
      default: return { background: '#9e9e9e', text: '#fff' };
    }
  };
  
  const riskColor = getRiskColor(prediction.riskLevel);
  
  // Prepare data for the doughnut chart
  const doughnutData = {
    labels: ['Risk', 'Safe'],
    datasets: [
      {
        data: [probabilityPercentage, 100 - probabilityPercentage],
        backgroundColor: [riskColor.background, '#e0e0e0'],
        hoverBackgroundColor: [riskColor.background, '#e0e0e0'],
        borderWidth: 0
      }
    ]
  };
  
  // Data for breast cancer specific factors radar chart
  const radarData = {
    labels: [
      'Family History', 
      'Genetic Factors', 
      'Age Risk', 
      'Hormonal Factors',
      'Lifestyle Factors',
      'Breast Density'
    ],
    datasets: [
      {
        label: 'Patient Risk Profile',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        data: [
          // Extract or calculate values from factors with fallbacks
          prediction.factors.find(f => f.name === 'Family History')?.weight * 100 || 20,
          prediction.factors.find(f => f.name === 'Genetic Factors')?.weight * 100 || 15,
          prediction.factors.find(f => f.name === 'Age Risk')?.weight * 100 || 30,
          prediction.factors.find(f => f.name === 'Hormonal Factors')?.weight * 100 || 25,
          prediction.factors.find(f => f.name === 'Lifestyle Factors')?.weight * 100 || 20,
          prediction.factors.find(f => f.name === 'Breast Density')?.weight * 100 || 35
        ]
      },
      {
        label: 'Population Average',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        data: [25, 15, 30, 25, 20, 30]
      }
    ]
  };
  
  // Breast-specific recommendations
  const breastCancerRecommendations = [
    { id: 1, title: "Regular Mammogram", description: "Schedule regular mammogram screenings based on your risk profile." },
    { id: 2, title: "Self-Examination", description: "Perform monthly breast self-examinations to detect any changes." },
    { id: 3, title: "Genetic Testing", description: "Consider BRCA1/BRCA2 genetic testing based on your family history." },
    { id: 4, title: "Lifestyle Changes", description: "Maintain a healthy weight and limit alcohol consumption to reduce risk." }
  ];

  return (
    <div className="breast-cancer-visualizer">
      <div className="visualization-header">
        <h3>Breast Cancer Risk Assessment</h3>
        
        <div className="risk-indicator" style={{ backgroundColor: riskColor.background, color: riskColor.text }}>
          {prediction.riskLevel.toUpperCase()} RISK LEVEL
        </div>
      </div>
      
      <div className="view-selector">
        <button 
          className={`view-btn ${activeView === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveView('risk')}
        >
          Risk Overview
        </button>
        <button 
          className={`view-btn ${activeView === 'factors' ? 'active' : ''}`}
          onClick={() => setActiveView('factors')}
        >
          Risk Factors
        </button>
        <button 
          className={`view-btn ${activeView === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveView('recommendations')}
        >
          Recommendations
        </button>
      </div>
      
      <div className="visualization-content">
        {activeView === 'risk' && (
          <div className="risk-overview">
            <div className="risk-gauge">
              <Doughnut 
                data={doughnutData}
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.raw}%`;
                        }
                      }
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
              <div className="risk-percentage">
                <span className="percentage-value">{probabilityPercentage}%</span>
                <span className="percentage-label">Risk</span>
              </div>
            </div>
            
            <div className="risk-interpretation">
              <h4>What This Means</h4>
              <p>
                Based on your profile, you have a <strong>{probabilityPercentage}%</strong> risk of developing breast 
                cancer in the next 5 years, compared to the average risk of 12.5% for women in your age group.
              </p>
              {prediction.riskLevel === 'high' || prediction.riskLevel === 'very high' ? (
                <div className="high-risk-alert">
                  <i className="fas fa-exclamation-circle"></i>
                  Your risk level indicates that you should consult with your healthcare provider for a personalized screening plan.
                </div>
              ) : (
                <div className="normal-risk-info">
                  <i className="fas fa-info-circle"></i>
                  Continue with regular screening as recommended for your age group.
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeView === 'factors' && (
          <div className="risk-factors">
            <div className="radar-chart">
              <h4>Your Risk Factor Profile</h4>
              <Radar 
                data={radarData}
                options={{
                  scales: {
                    r: {
                      angleLines: { display: true },
                      suggestedMin: 0,
                      suggestedMax: 100
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
            
            <div className="key-factors">
              <h4>Key Risk Factors</h4>
              <ul className="factors-list">
                {prediction.factors.map((factor, index) => (
                  <li key={index} className="factor-item">
                    <div className="factor-name">{factor.name}</div>
                    <div className="factor-bar-container">
                      <div 
                        className="factor-bar" 
                        style={{ 
                          width: `${factor.weight * 100}%`,
                          backgroundColor: factor.weight > 0.5 ? '#f44336' : '#ff9800'
                        }}
                      ></div>
                      <span className="factor-value">{(factor.weight * 100).toFixed(1)}%</span>
                    </div>
                    {factor.description && (
                      <div className="factor-description">{factor.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            {prediction.protectiveFactors && prediction.protectiveFactors.length > 0 && (
              <div className="protective-factors">
                <h4>Protective Factors</h4>
                <ul className="protective-factors-list">
                  {prediction.protectiveFactors.map((factor, index) => (
                    <li key={index} className="protective-factor">
                      <i className="fas fa-shield-alt"></i>
                      <span>{factor.name}: {factor.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {activeView === 'recommendations' && (
          <div className="recommendations">
            <div className="screening-recommendations">
              <h4>Screening Recommendations</h4>
              <div className="recommendation-cards">
                {breastCancerRecommendations.map(rec => (
                  <div key={rec.id} className="recommendation-card">
                    <div className="recommendation-icon">
                      <i className="fas fa-clipboard-check"></i>
                    </div>
                    <div className="recommendation-content">
                      <h5>{rec.title}</h5>
                      <p>{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="next-steps">
              <h4>Next Steps</h4>
              <ol className="steps-list">
                <li>Discuss these results with your healthcare provider</li>
                <li>Schedule recommended screenings</li>
                <li>Consider lifestyle modifications to reduce risk</li>
                <li>Follow up on any additional testing recommended</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreastCancerVisualizer;
