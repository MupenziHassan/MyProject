import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/apiConfig';
import Icon from '../utils/IconFallbacks';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 87,
    doctors: 12,
    patients: 68,
    pendingVerifications: 3,
    systemHealth: 'Healthy'
  });
  const [recentUsers, setRecentUsers] = useState([
    { _id: 1, name: 'John Doe', email: 'john@example.com', role: 'patient', createdAt: new Date() },
    { _id: 2, name: 'Dr. Sarah Smith', email: 'sarah@example.com', role: 'doctor', createdAt: new Date() },
    { _id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'patient', createdAt: new Date() }
  ]);
  const [pendingDoctors, setPendingDoctors] = useState([
    { _id: 1, name: 'Dr. James Wilson', email: 'james@example.com', specialty: 'Cardiology', submittedAt: new Date() },
    { _id: 2, name: 'Dr. Emily Brown', email: 'emily@example.com', specialty: 'Neurology', submittedAt: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Uncomment when backend is ready
        /*
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data.data);
        
        const usersRes = await api.get('/admin/recent-users');
        setRecentUsers(usersRes.data.data.slice(0, 5));
        
        const doctorsRes = await api.get('/admin/pending-doctors');
        setPendingDoctors(doctorsRes.data.data.slice(0, 5));
        */
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);
  
  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {currentUser?.name || 'Admin'}
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-outline-primary me-2">
            <Icon name="FaCog" size={16} /> Settings
          </button>
          <button className="btn btn-primary">
            <Icon name="FaDatabase" size={16} /> Generate Report
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Icon name="FaUsers" size={24} />
          </div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-change positive">
            +7 new this week
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">
            <Icon name="FaUserMd" size={24} />
          </div>
          <div className="stat-value">{stats.doctors}</div>
          <div className="stat-label">Doctors</div>
          <div className="stat-change positive">
            +2 new doctors
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <Icon name="FaClipboardList" size={24} />
          </div>
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Patients</div>
          <div className="stat-change positive">
            +5 new patients
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <Icon name="FaExclamationTriangle" size={24} />
          </div>
          <div className="stat-value">{stats.pendingVerifications}</div>
          <div className="stat-label">Pending Verifications</div>
          <div className="stat-change">
            Requiring attention
          </div>
        </div>
      </div>
      
      <div className="content-grid">
        <div className="dashboard-card system-health-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">System Health</h2>
            <span className={`status-badge ${stats.systemHealth === 'Healthy' ? 'active' : 'critical'}`}>
              {stats.systemHealth}
            </span>
          </div>
          <div className="dashboard-card-body">
            <div className="system-metrics">
              <div className="metric">
                <div className="metric-title">
                  <Icon name="FaServer" size={16} /> Server Status
                </div>
                <div className="metric-value">
                  <span className="status-badge active">Online</span>
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-title">
                  <Icon name="FaUsers" size={16} /> Active Users
                </div>
                <div className="metric-value">
                  28 online now
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-title">
                  <Icon name="FaUserCheck" size={16} /> Last Backup
                </div>
                <div className="metric-value">
                  Today at 03:00 AM
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-title">
                  <Icon name="FaChartArea" size={16} /> System Load
                </div>
                <div className="metric-value">
                  <div className="progress-bar">
                    <div className="progress-value" style={{ width: '32%' }}></div>
                  </div>
                  <span>32% - Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Recent User Activity</h2>
            <button className="btn btn-sm btn-outline-primary">View All</button>
          </div>
          <div className="dashboard-card-body">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${
                        user.role === 'doctor' ? 'info' : 
                        user.role === 'admin' ? 'warning' : 'active'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dashboard-card-footer">
            <a href="/admin/users">Manage all users →</a>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="dashboard-card-title">Doctors Pending Verification</h2>
          <button className="btn btn-sm btn-outline-primary">View All</button>
        </div>
        <div className="dashboard-card-body">
          {pendingDoctors.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.specialty}</td>
                    <td>{new Date(doctor.submittedAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button className="btn btn-sm btn-success me-2">Approve</button>
                      <button className="btn btn-sm btn-danger">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="FaUserCheck" size={36} />
              </div>
              <p>No pending verification requests</p>
            </div>
          )}
        </div>
        <div className="dashboard-card-footer">
          <a href="/admin/verifications">Manage all verifications →</a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
