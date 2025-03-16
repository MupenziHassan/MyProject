import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TestManagement = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/tests/doctor');
        setTests(res.data.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load tests');
        setLoading(false);
      }
    };
    
    fetchTests();
  }, []);

  if (loading) return <div className="loading">Loading tests...</div>;

  return (
    <div className="test-management">
      <h3>Recent Test Orders</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {tests.length === 0 ? (
        <div className="no-data">No tests ordered</div>
      ) : (
        <div className="test-list">
          {tests.slice(0, 5).map(test => (
            <div key={test._id} className="test-item">
              <div className="test-type">{test.name}</div>
              <div className="patient-name">{test.patient?.name || 'Unknown Patient'}</div>
              <div className="test-date">{new Date(test.date || test.createdAt).toLocaleDateString()}</div>
              <div className="test-status">
                <span className={`status-${test.status}`}>{test.status}</span>
              </div>
              <div className="test-actions">
                <Link to={`/doctor/tests/${test._id}`} className="btn btn-sm btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
          
          {tests.length > 5 && (
            <div className="view-all">
              <Link to="/doctor/tests">View all tests</Link>
            </div>
          )}
        </div>
      )}
      
      <div className="action-buttons">
        <Link to="/doctor/tests/order" className="btn btn-primary">
          Order New Test
        </Link>
      </div>
    </div>
  );
};

export default TestManagement;
