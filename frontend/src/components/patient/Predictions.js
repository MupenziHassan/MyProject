import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get('/api/v1/patients/predictions');
        setPredictions(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load predictions');
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const getRiskClass = (level) => {
    switch (level) {
      case 'low':
        return 'risk-low';
      case 'moderate':
        return 'risk-moderate';
      case 'high':
        return 'risk-high';
      case 'very high':
        return 'risk-very-high';
      default:
        return '';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="predictions">
      <h2>Health Predictions</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {predictions.length === 0 ? (
        <div className="no-predictions">
          <p>No predictions available.</p>
        </div>
      ) : (
        <div className="predictions-list">
          {predictions.map((prediction) => (
            <div key={prediction._id} className="prediction-card">
              <div className="prediction-header">
                <h3>{prediction.condition}</h3>
                <span className={`risk-badge ${getRiskClass(prediction.riskLevel)}`}>
                  {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)} Risk
                </span>
              </div>
              
              <div className="prediction-details">
                <p><strong>Probability:</strong> {Math.round(prediction.probability * 100)}%</p>
                <p><strong>Date:</strong> {new Date(prediction.createdAt).toLocaleDateString()}</p>
                <p><strong>Doctor:</strong> {prediction.doctor.name}</p>
                
                <div className="prediction-actions">
                  <Link to={`/predictions/${prediction._id}`} className="btn btn-outline">
                    View Full Analysis
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Predictions;
