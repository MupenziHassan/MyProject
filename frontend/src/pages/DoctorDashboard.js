import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/apiConfig';
import Icon from '../utils/IconFallbacks';
import '../styles/Dashboard.css';

const DoctorDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    patients: 24,
    appointments: 8,
    completedAppointments: 16,
    pendingReviews: 5
  });
  const [appointments, setAppointments] = useState([
    { _id: 1, dateTime: new Date(), patient: { name: 'John Doe' }, purpose: 'Check-up', status: 'confirmed' },
    { _id: 2, dateTime: new Date(Date.now() + 7200000), patient: { name: 'Jane Smith' }, purpose: 'Follow-up', status: 'pending' }
  ]);
  const [patients, setPatients] = useState([
    { _id: 1, name: 'John Doe', lastVisit: new Date(Date.now() - 604800000), healthStatus: 'Stable' },
    { _id: 2, name: 'Jane Smith', lastVisit: new Date(Date.now() - 1209600000), healthStatus: 'Improving' },
    { _id: 3, name: 'Robert Johnson', lastVisit: new Date(Date.now() - 2592000000), healthStatus: 'Critical' }
  ]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        // Fetch doctor dashboard data
        // Uncomment when API is ready
        /*
        const statsRes = await api.get('/doctors/stats');
        setStats(statsRes.data.data);
        
        const appointmentsRes = await api.get('/doctors/appointments');
        setAppointments(appointmentsRes.data.data.slice(0, 5));
        
        const patientsRes = await api.get('/doctors/patients');
        setPatients(patientsRes.data.data.slice(0, 5));
        */
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctor data:', err);
        setLoading(false);
      }
    };
    
    fetchDoctorData();
  }, []);
  
  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Doctor Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, Dr. {currentUser?.name || 'Doctor'}
          </p>
        </div>
        <div className="last-login">
          <Icon name="FaClock" size={16} /> Last login: {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card info">
          <div className="stat-icon">
            <Icon name="FaUserInjured" size={24} />
          </div>
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Total Patients</div>
          <div className="stat-change positive">
            +3 new this month
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <Icon name="FaCalendarAlt" size={24} />
          </div>
          <div className="stat-value">{stats.appointments}</div>
          <div className="stat-label">Upcoming Appointments</div>
          <div className="stat-change">
            Next: Today at 2:00 PM
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <Icon name="FaClipboardCheck" size={24} />
          </div>
          <div className="stat-value">{stats.completedAppointments}</div>
          <div className="stat-label">Completed Appointments</div>
          <div className="stat-change positive">
            +12 this month
          </div>
        </div>
        
        <div className="stat-card primary">
          <div className="stat-icon">
            <Icon name="FaFileMedical" size={24} />
          </div>
          <div className="stat-value">{stats.pendingReviews}</div>
          <div className="stat-label">Pending Reviews</div>
          <div className="stat-change">
            Requiring attention
          </div>
        </div>
      </div>
      
      <div className="content-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Today's Appointments</h2>
            <button className="btn btn-sm btn-outline-primary">View Schedule</button>
          </div>
          <div className="dashboard-card-body">
            {appointments.length > 0 ? (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{appointment.patient.name}</td>
                      <td>{appointment.purpose}</td>
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
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </div>
          <div className="dashboard-card-footer">
            <a href="/doctor/appointments">Manage appointments →</a>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Recent Patients</h2>
            <button className="btn btn-sm btn-outline-primary">View All</button>
          </div>
          <div className="dashboard-card-body">
            {patients.length > 0 ? (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Last Visit</th>
                    <th>Health Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id}>
                      <td>{patient.name}</td>
                      <td>{new Date(patient.lastVisit).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${patient.healthStatus === 'Stable' ? 'active' : patient.healthStatus === 'Critical' ? 'critical' : 'warning'}`}>
                          {patient.healthStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No patient records found</p>
              </div>
            )}
          </div>
          <div className="dashboard-card-footer">
            <a href="/doctor/patients">View all patients →</a>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="dashboard-card-title">Predictions Requiring Review</h2>
          <button className="btn btn-sm btn-outline-primary">View All</button>
        </div>
        <div className="dashboard-card-body">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Prediction Type</th>
                <th>AI Result</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Today</td>
                <td>John Doe</td>
                <td>Diabetes Risk</td>
                <td><span className="status-badge warning">Elevated Risk</span></td>
                <td><button className="btn btn-sm btn-primary">Review</button></td>
              </tr>
              <tr>
                <td>Yesterday</td>
                <td>Jane Smith</td>
                <td>Heart Disease</td>
                <td><span className="status-badge critical">High Risk</span></td>
                <td><button className="btn btn-sm btn-primary">Review</button></td>
              </tr>
              <tr>
                <td>2 days ago</td>
                <td>Robert Johnson</td>
                <td>Stroke Risk</td>
                <td><span className="status-badge active">Low Risk</span></td>
                <td><button className="btn btn-sm btn-primary">Review</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
