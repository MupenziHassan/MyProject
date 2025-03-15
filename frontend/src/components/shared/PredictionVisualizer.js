import React, { useState } from 'react';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement
);

const PredictionVisualizer = ({ prediction, showDetails = true }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Format probability as percentage
  const probabilityPercentage = (prediction.probability * 100).toFixed(1);
  
  // Get color based on risk level
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return { background: '#4caf50', text: '#fff' };
      case 'moderate':
        return { background: '#ff9800', text: '#fff' };
      case 'high':
        return { background: '#f44336', text: '#fff' };
      case 'very high':
        return { background: '#9c27b0', text: '#fff' };
      default:
        return { background: '#9e9e9e', text: '#fff' };
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
  
  // Prepare data for the factors bar chart
  const factorLabels = prediction.factors.map(factor => factor.name);
  const factorData = prediction.factors.map(factor => factor.weight * 100);
  
  const barData = {
    labels: factorLabels,
    datasets: [
      {
        label: 'Impact (%)',
        data: factorData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Radar chart for comparing with population average
  // This is mockup data as we don't have population data
  const radarData = {
    labels: ['Age Risk', 'Genetic Risk', 'Lifestyle Risk', 'Environmental Risk', 'Medical History Risk'],
    datasets: [
      {
        label: 'Patient',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        data: [
          prediction.probability * 100 * (Math.random() * 0.4 + 0.8), // Age
          prediction.probability * 100 * (Math.random() * 0.4 + 0.8), // Genetic
          prediction.probability * 100 * (Math.random() * 0.4 + 0.8), // Lifestyle
          prediction.probability * 100 * (Math.random() * 0.4 + 0.8), // Environmental
          prediction.probability * 100 * (Math.random() * 0.4 + 0.8)  // Medical History
        ]
      },
      {
        label: 'Population Average',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        data: [40, 30, 45, 35, 25]
      }
    ]
  };

  return (
    <div className="prediction-visualizer">
      <div className="prediction-header">
        <div className="prediction-title">
          <h3>{prediction.condition} Risk Assessment</h3>
          <div 
            className="risk-badge" 
            style={{ backgroundColor: riskColor.background, color: riskColor.text }}
          >
            {prediction.riskLevel.toUpperCase()} RISK
          </div>
        </div>
        
        {prediction.modelInfo && (
          <div className="model-info">
            <small>Model: {prediction.modelInfo.name} ({prediction.modelInfo.version})</small>
            <small>Accuracy: {(prediction.modelInfo.accuracy * 100).toFixed(1)}%</small>
          </div>
        )}
      </div>
      
      <div className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'factors' ? 'active' : ''}`}
          onClick={() => setActiveTab('factors')}
        >
          Risk Factors
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          Comparison
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="prediction-gauge">
              <div className="doughnut-container">
                <Doughnut 
                  data={doughnutData} 
                  options={{
                    cutout: '70%',
                    plugins: {
                      legend: {
                        display: false
                      },
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
              </div>
              <div className="prediction-percentage">
                <span className="percentage">{probabilityPercentage}%</span>
                <span className="risk-text">Risk</span>
              </div>
            </div>
            
            <div className="prediction-summary">
              <p className="summary-text">
                Based on your medical data, you have a <strong>{probabilityPercentage}%</strong> probability 
                of developing {prediction.condition.toLowerCase()}, which is considered a 
                <strong> {prediction.riskLevel}</strong> risk level.
              </p>
              
              {prediction.confidenceInterval && (
                <p className="confidence-interval">
                  <small>Confidence Interval: {(prediction.confidenceInterval.lower * 100).toFixed(1)}% - {(prediction.confidenceInterval.upper * 100).toFixed(1)}%</small>
                </p>
              )}
            </div>
            
            {showDetails && prediction.recommendations && prediction.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h4>Recommendations</h4>
                <ul className="recommendations-list">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index} className={`recommendation ${rec.priority ? `priority-${rec.priority}` : ''}`}>
                      {rec.category && <span className="recommendation-category">{rec.category}</span>}
                      {rec.description}
                      {rec.timeframe && <span className="recommendation-timeframe">{rec.timeframe}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'factors' && (
          <div className="factors-tab">
            <div className="factors-chart">
              <Bar 
                data={barData} 
                options={{
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Impact: ${context.raw.toFixed(1)}%`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Impact on Risk (%)'
                      },
                      max: 100
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
            
            {showDetails && prediction.factors && prediction.factors.length > 0 && (
              <div className="factors-details">
                <h4>Risk Factor Details</h4>
                <div className="factors-grid">
                  {prediction.factors.map((factor, index) => (
                    <div key={index} className="factor-card">
                      <div className="factor-header">
                        <h5>{factor.name}</h5>
                        <span className="factor-weight">{(factor.weight * 100).toFixed(1)}%</span>
                      </div>
                      {factor.description && (
                        <p className="factor-description">{factor.description}</p>
                      )}
                      {factor.category && (
                        <span className="factor-category">{factor.category}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {showDetails && prediction.protectiveFactors && prediction.protectiveFactors.length > 0 && (
              <div className="protective-factors">
                <h4>Protective Factors</h4>
                <ul className="protective-factors-list">
                  {prediction.protectiveFactors.map((factor, index) => (
                    <li key={index}>
                      <span className="protective-factor-name">{factor.name}</span>
                      {factor.description && <span className="protective-factor-desc">{factor.description}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'comparison' && (
          <div className="comparison-tab">
            <div className="radar-chart">
              <Radar 
                data={radarData}
                options={{
                  scales: {
                    r: {
                      angleLines: {
                        display: true
                      },
                      suggestedMin: 0,
                      suggestedMax: 100
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
            
            <div className="comparison-explanation">
              <h4>Risk Comparison</h4>
              <p>
                This radar chart compares your risk factors to the average population. 
                Areas where your score exceeds the population average may be key areas 
                to focus on for risk reduction.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionVisualizer;
