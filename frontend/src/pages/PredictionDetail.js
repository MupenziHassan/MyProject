import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import CancerVisualizerFactory from '../components/visualizations/CancerVisualizerFactory';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PredictionDetail = () => {
  const { predictionId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [prediction, setPrediction] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPredictionData = async () => {
      try {
        setLoading(true);
        
        // Fetch prediction details
        const predRes = await axios.get(`/api/v1/predictions/${predictionId}`);
        setPrediction(predRes.data.data);
        
        // Fetch patient data if needed for visualization
        if (predRes.data.data.patient) {
          let patientRes;
          if (currentUser.role === 'doctor') {
            patientRes = await axios.get(`/api/v1/doctors/patients/${predRes.data.data.patient}`);
            setPatientData({
              ...patientRes.data.data.user,
              ...patientRes.data.data.patientProfile
            });
          } else if (currentUser.role === 'patient') {
            patientRes = await axios.get('/api/v1/patients/me');
            setPatientData(patientRes.data.data);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load prediction data');
        setLoading(false);
      }
    };

    fetchPredictionData();
  }, [predictionId, currentUser]);

  if (loading) return <LoadingSpinner message="Loading prediction details..." />;
  
  if (error) return <div className="error-alert">{error}</div>;
  
  if (!prediction) return <div className="not-found">Prediction not found</div>;

  return (
    <div className="prediction-detail-page">
      <div className="page-header">
        <div className="header-content">
          <h2>Prediction Details</h2>
          <div className="header-actions">
            <Link to="/dashboard" className="btn btn-outline">
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </Link>
            
            {currentUser.role === 'doctor' && (
              <button className="btn btn-primary">
                <i className="fas fa-file-pdf"></i> Generate Report
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="prediction-container">
        <CancerVisualizerFactory 
          prediction={prediction} 
          patientData={patientData}
        />
        
        <div className="prediction-metadata">
          <div className="metadata-card">
            <h3>Prediction Information</h3>
            <div className="metadata-item">
              <span className="label">Date:</span>
              <span className="value">{new Date(prediction.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Doctor:</span>
              <span className="value">Dr. {prediction.doctor?.name || 'Unknown'}</span>
            </div>
            {prediction.modelInfo && (
              <>
                <div className="metadata-item">
                  <span className="label">Model:</span>
                  <span className="value">{prediction.modelInfo.name} v{prediction.modelInfo.version}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Model Accuracy:</span>
                  <span className="value">{(prediction.modelInfo.accuracy * 100).toFixed(1)}%</span>
                </div>
              </>
            )}
          </div>
          
          {/* More metadata sections can be added here */}
        </div>
      </div>
    </div>
  );
};

export default PredictionDetail;
