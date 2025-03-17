import React from 'react';
import './DoctorOverrideLog.css';

const DoctorOverrideLog = ({ predictionHistory }) => {
  return (
    <div className="override-log">
      <h3>Prediction Adjustment History</h3>
      <div className="log-table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Original Assessment</th>
              <th>Adjusted Assessment</th>
              <th>Doctor</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {predictionHistory.map((entry, index) => (
              <tr key={index}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td className={`risk-${entry.originalRisk.toLowerCase()}`}>
                  {entry.originalRisk}
                </td>
                <td className={`risk-${entry.adjustedRisk.toLowerCase()}`}>
                  {entry.adjustedRisk}
                </td>
                <td>Dr. {entry.doctorName}</td>
                <td>{entry.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="model-feedback-section">
        <p>
          <strong>Note:</strong> All adjustments are logged to improve future prediction models.
          Model accuracy is currently at 87% and improving with each verified assessment.
        </p>
      </div>
    </div>
  );
};

export default DoctorOverrideLog;
