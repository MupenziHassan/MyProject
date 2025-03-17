// A more detailed visualization for doctors with confidence intervals and actions
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../../utils/IconFallbacks';
import './RiskDisplay.css';

const DoctorRiskDisplay = ({ prediction, onReview }) => {
  const [notes, setNotes] = useState('');
  const [adjustedRisk, setAdjustedRisk] = useState(prediction.riskLevel);
  const history = useHistory();
  
  const handleOrderTests = () => {
    history.push(`/doctor/patients/${prediction.patientId}/tests/order`);
  };
  
  const handleSubmitReview = () => {
    onReview({
      predictionId: prediction.id,
      doctorNotes: notes,
      adjustedRisk: adjustedRisk
    });
  };
  
  return (
    <div className="doctor-risk-card">
      <div className="prediction-header">
        <h3>{prediction.conditionName} Risk Assessment for {prediction.patientName}</h3>
        <span className="date">{new Date(prediction.createdAt).toLocaleDateString()}</span>
      </div>
      
      <div className="prediction-details">
        <div className="risk-metrics">
          <div className="metric-item">
            <label>Risk Score:</label>
            <span className="value">{prediction.riskScore}/100</span>
          </div>
          <div className="metric-item">
            <label>Confidence:</label>
            <span className="value">{prediction.confidence}% (±{prediction.marginOfError}%)</span>
          </div>
          <div className="metric-item">
            <label>Model Version:</label>
            <span className="value">{prediction.modelVersion}</span>
          </div>
        </div>
        
        <div className="factor-analysis">
          <h4>Contributing Factors:</h4>
          <table className="factors-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Patient Value</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {prediction.factors.map((factor, index) => (
                <tr key={index}>
                  <td>{factor.name}</td>
                  <td>{factor.value} {factor.unit}</td>
                  <td>
                    <div className="impact-bar" style={{ width: `${factor.impact * 100}%` }}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="doctor-actions">
          <div className="adjustment-section">
            <label>Risk Adjustment:</label>
            <select 
              value={adjustedRisk}
              onChange={(e) => setAdjustedRisk(e.target.value)}
            >
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
          
          <div className="notes-section">
            <label>Doctor's Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your clinical assessment and notes here..."
            ></textarea>
          </div>
          
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleSubmitReview}>
              <Icon name="FaCheck" size={16} /> Save Review
            </button>
            <button className="btn btn-secondary" onClick={handleOrderTests}>
              <Icon name="FaVial" size={16} /> Order Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRiskDisplay;
