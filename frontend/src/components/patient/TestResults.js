import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TestResults = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get('/api/v1/patients/tests');
        setTests(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load test results');
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'collected':
        return 'status-collected';
      case 'ordered':
        return 'status-ordered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="test-results">
      <h2>Test Results</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {tests.length === 0 ? (
        <div className="no-results">
          <p>No test results available.</p>
        </div>
      ) : (
        <div className="results-list">
          {tests.map((test) => (
            <div key={test._id} className="test-result-card">
              <div className="test-header">
                <h3>{test.name}</h3>
                <span className={`test-status ${getStatusClass(test.status)}`}>
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </span>
              </div>
              
              <div className="test-info">
                <p><strong>Date:</strong> {new Date(test.date).toLocaleDateString()}</p>
                <p><strong>Doctor:</strong> {test.doctor.name}</p>
                
                {test.status === 'completed' && (
                  <Link to={`/tests/${test._id}`} className="btn btn-outline">
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestResults;
