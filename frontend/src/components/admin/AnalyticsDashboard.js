import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title 
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title
);

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);
  
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/admin/analytics?range=${timeRange}`);
      setAnalyticsData(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };
  
  // User Activity Chart
  const userActivityData = {
    labels: analyticsData?.userActivity?.labels || [],
    datasets: [
      {
        label: 'Patient Logins',
        data: analyticsData?.userActivity?.patients || [],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Doctor Logins',
        data: analyticsData?.userActivity?.doctors || [],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        fill: false,
        tension: 0.4
      }
    ]
  };
  
  // Prediction Distribution Chart
  const predictionDistributionData = {
    labels: ['Low', 'Moderate', 'High', 'Very High'],
    datasets: [
      {
        label: 'Predictions by Risk Level',
        data: [
          analyticsData?.predictions?.riskDistribution?.low || 0,
          analyticsData?.predictions?.riskDistribution?.moderate || 0,
          analyticsData?.predictions?.riskDistribution?.high || 0,
          analyticsData?.predictions?.riskDistribution?.veryHigh || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Test Volume Chart
  const testVolumeData = {
    labels: analyticsData?.tests?.labels || [],
    datasets: [
      {
        label: 'Number of Tests',
        data: analyticsData?.tests?.counts || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Cancer Type Distribution Chart
  const cancerTypeData = {
    labels: analyticsData?.predictions?.cancerTypes?.labels || [],
    datasets: [
      {
        label: 'Predictions by Cancer Type',
        data: analyticsData?.predictions?.cancerTypes?.counts || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Model Performance Chart
  const modelPerformanceData = {
    labels: analyticsData?.models?.labels || [],
    datasets: [
      {
        label: 'Accuracy',
        data: analyticsData?.models?.accuracy || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Usage Count',
        data: analyticsData?.models?.usage || [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        type: 'line',
        yAxisID: 'y1'
      }
    ]
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading analytics data...</p></div>;
  
  if (error) return <div className="error-alert">{error}</div>;
  
  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>System Analytics</h2>
        
        <div className="time-range-filters">
          <button 
            className={`btn ${timeRange === 'week' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTimeRange('week')}
          >
            Last Week
          </button>
          <button 
            className={`btn ${timeRange === 'month' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTimeRange('month')}
          >
            Last Month
          </button>
          <button 
            className={`btn ${timeRange === 'year' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTimeRange('year')}
          >
            Last Year
          </button>
          <button 
            className={`btn ${timeRange === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="metrics-summary">
        <div className="metric-card">
          <div className="metric-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <div className="metric-value">{analyticsData?.users?.total || 0}</div>
            <div className="metric-change positive">
              <i className="fas fa-arrow-up"></i> 
              {analyticsData?.users?.growth || 0}%
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon predictions">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h3>Predictions</h3>
            <div className="metric-value">{analyticsData?.predictions?.total || 0}</div>
            <div className="metric-secondary">
              Accuracy: {analyticsData?.predictions?.accuracy ? (analyticsData.predictions.accuracy * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon tests">
            <i className="fas fa-vial"></i>
          </div>
          <div className="metric-content">
            <h3>Medical Tests</h3>
            <div className="metric-value">{analyticsData?.tests?.total || 0}</div>
            <div className="metric-secondary">
              {analyticsData?.tests?.completed || 0} Completed
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon risk">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="metric-content">
            <h3>High Risk Patients</h3>
            <div className="metric-value">
              {analyticsData?.predictions?.highRiskCount || 0}
            </div>
            <div className="metric-secondary">
              {analyticsData?.predictions?.highRiskPercentage || 0}% of total
            </div>
          </div>
        </div>
      </div>
      
      <div className="chart-row">
        <div className="chart-container">
          <h3>User Activity</h3>
          <div className="chart-wrapper">
            <Line 
              data={userActivityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Logins'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: timeRange === 'week' ? 'Day' : timeRange === 'month' ? 'Week' : 'Month'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Prediction Distribution</h3>
          <div className="chart-wrapper">
            <Pie 
              data={predictionDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="chart-row">
        <div className="chart-container">
          <h3>Test Volume</h3>
          <div className="chart-wrapper">
            <Bar 
              data={testVolumeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Tests'
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Cancer Type Distribution</h3>
          <div className="chart-wrapper">
            <Pie 
              data={cancerTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="chart-container full-width">
        <h3>Model Performance & Usage</h3>
        <div className="chart-wrapper">
          <Bar 
            data={modelPerformanceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  beginAtZero: true,
                  max: 1,
                  title: {
                    display: true,
                    text: 'Accuracy'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  beginAtZero: true,
                  grid: {
                    drawOnChartArea: false
                  },
                  title: {
                    display: true,
                    text: 'Usage Count'
                  }
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="analytics-insights">
        <h3>Key Insights</h3>
        <div className="insights-container">
          {analyticsData?.insights?.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <div className="insight-icon">
                <i className={`fas fa-${insight.icon || 'lightbulb'}`}></i>
              </div>
              <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.description}</p>
                {insight.trend && (
                  <div className={`trend ${insight.trend > 0 ? 'positive' : insight.trend < 0 ? 'negative' : 'neutral'}`}>
                    {insight.trend > 0 ? (
                      <><i className="fas fa-arrow-up"></i> {insight.trend}% increase</>
                    ) : insight.trend < 0 ? (
                      <><i className="fas fa-arrow-down"></i> {Math.abs(insight.trend)}% decrease</>
                    ) : (
                      <><i className="fas fa-minus"></i> No change</>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
