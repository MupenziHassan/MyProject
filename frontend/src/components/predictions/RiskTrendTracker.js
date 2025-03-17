import React from 'react';
import { Line } from 'react-chartjs-2';
import './RiskTrendTracker.css';

const RiskTrendTracker = ({ riskHistory, conditionType }) => {
  // Prepare data for chart
  const dates = riskHistory.map(item => 
    new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  
  const riskScores = riskHistory.map(item => item.riskScore);
  
  const chartData = {
    labels: dates,
    datasets: [
      {
        label: `${conditionType} Risk Score`,
        data: riskScores,
        fill: false,
        borderColor: '#3498db',
        tension: 0.1,
        pointBackgroundColor: riskScores.map(score => 
          score < 30 ? '#27ae60' : score < 70 ? '#f39c12' : '#c0392b'
        )
      }
    ]
  };
  
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Risk Score'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const score = context.raw;
            let riskLevel = 'Low';
            if (score >= 70) riskLevel = 'High';
            else if (score >= 30) riskLevel = 'Moderate';
            return `Risk Score: ${score} (${riskLevel})`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };
  
  return (
    <div className="risk-trend-tracker">
      <h3>Your Risk Trend Over Time</h3>
      <div className="trend-chart-container">
        <Line data={chartData} options={chartOptions} height={300} />
      </div>
      <div className="trend-analysis">
        {riskHistory.length > 1 && (
          <div className="trend-summary">
            {riskHistory[0].riskScore > riskHistory[riskHistory.length - 1].riskScore ? (
              <div className="trend-improving">
                <span className="trend-icon">📉</span>
                <p>Your risk is decreasing! Keep up the good work with your health management.</p>
              </div>
            ) : riskHistory[0].riskScore < riskHistory[riskHistory.length - 1].riskScore ? (
              <div className="trend-worsening">
                <span className="trend-icon">📈</span>
                <p>Your risk has increased. Consider discussing this trend with your doctor.</p>
              </div>
            ) : (
              <div className="trend-stable">
                <span className="trend-icon">📊</span>
                <p>Your risk level has remained stable over this period.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskTrendTracker;
