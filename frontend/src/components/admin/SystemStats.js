import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SystemStats = () => {
  const [stats, setStats] = useState({
    users: { total: 0, patients: 0, doctors: 0, admins: 0 },
    tests: { total: 0, completed: 0, processing: 0, ordered: 0 },
    predictions: { total: 0, byRisk: { low: 0, moderate: 0, high: 0, veryHigh: 0 } },
    activity: { 
      lastWeek: [0, 0, 0, 0, 0, 0, 0], 
      labels: [] // Will hold last 7 days
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const res = await axios.get('/api/v1/admin/stats');
        
        // Generate labels for last 7 days
        const labels = Array(7).fill().map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });
        
        setStats({
          ...res.data.data,
          activity: {
            ...res.data.data.activity,
            labels
          }
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load system statistics');
        setLoading(false);
      }
    };

    fetchSystemStats();
  }, []);

  // Chart configurations
  const userChartData = {
    labels: ['Patients', 'Doctors', 'Admins'],
    datasets: [
      {
        label: 'Users by Role',
        data: [stats.users.patients, stats.users.doctors, stats.users.admins],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const testChartData = {
    labels: ['Completed', 'Processing', 'Ordered', 'Other'],
    datasets: [
      {
        label: 'Tests by Status',
        data: [
          stats.tests.completed, 
          stats.tests.processing, 
          stats.tests.ordered,
          stats.tests.total - (stats.tests.completed + stats.tests.processing + stats.tests.ordered)
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const riskChartData = {
    labels: ['Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk'],
    datasets: [
      {
        label: 'Predictions by Risk Level',
        data: [
          stats.predictions.byRisk.low,
          stats.predictions.byRisk.moderate,
          stats.predictions.byRisk.high,
          stats.predictions.byRisk.veryHigh
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

  const activityChartData = {
    labels: stats.activity.labels,
    datasets: [
      {
        label: 'User Activity',
        data: stats.activity.lastWeek,
        fill: false,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4
      }
    ]
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>;

  return (
    <div className="system-stats">
      <h2>System Analytics Dashboard</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-details">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.users.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon tests">
            <i className="fas fa-vial"></i>
          </div>
          <div className="stat-details">
            <h3>Total Tests</h3>
            <p className="stat-value">{stats.tests.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon predictions">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-details">
            <h3>Predictions</h3>
            <p className="stat-value">{stats.predictions.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon doctors">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="stat-details">
            <h3>Verified Doctors</h3>
            <p className="stat-value">{stats.users.doctors}</p>
          </div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-row">
          <div className="chart-card">
            <h3>User Distribution</h3>
            <div className="chart-container">
              <Pie data={userChartData} options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                responsive: true,
                maintainAspectRatio: false
              }} />
            </div>
          </div>
          
          <div className="chart-card">
            <h3>Test Status Distribution</h3>
            <div className="chart-container">
              <Bar data={testChartData} options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                },
                responsive: true,
                maintainAspectRatio: false
              }} />
            </div>
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-card">
            <h3>Predictions by Risk Level</h3>
            <div className="chart-container">
              <Pie data={riskChartData} options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                responsive: true,
                maintainAspectRatio: false
              }} />
            </div>
          </div>
          
          <div className="chart-card">
            <h3>User Activity (Last 7 Days)</h3>
            <div className="chart-container">
              <Line data={activityChartData} options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Activity Count'
                    }
                  }
                },
                responsive: true,
                maintainAspectRatio: false
              }} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="system-info-section">
        <h3>System Information</h3>
        <div className="info-cards">
          <div className="info-card">
            <h4>Server Status</h4>
            <div className="status-indicator online"></div>
            <p>Online</p>
          </div>
          
          <div className="info-card">
            <h4>Database Status</h4>
            <div className="status-indicator online"></div>
            <p>Connected</p>
          </div>
          
          <div className="info-card">
            <h4>API Response Time</h4>
            <p className="response-time">120ms</p>
          </div>
          
          <div className="info-card">
            <h4>Last Backup</h4>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
