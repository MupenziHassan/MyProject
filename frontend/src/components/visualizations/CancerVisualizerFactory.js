import React from 'react';
import BreastCancerVisualizer from './BreastCancerVisualizer';
import LungCancerVisualizer from './LungCancerVisualizer';
import PredictionVisualizer from '../shared/PredictionVisualizer';

/**
 * Factory component that renders the appropriate cancer-specific visualizer
 * based on the cancer type in the prediction
 */
const CancerVisualizerFactory = ({ prediction, patientData }) => {
  if (!prediction) {
    return <div className="error-message">No prediction data available</div>;
  }
  
  // Determine which specialized visualizer to use based on cancer type
  const renderVisualizer = () => {
    switch (prediction.cancerType?.toLowerCase()) {
      case 'breast':
        return <BreastCancerVisualizer prediction={prediction} patientData={patientData} />;
      case 'lung':
        return <LungCancerVisualizer prediction={prediction} patientData={patientData} />;
      // Add more specialized visualizers as needed
      default:
        // Fallback to generic visualizer
        return <PredictionVisualizer prediction={prediction} showDetails={true} />;
    }
  };

  return (
    <div className="cancer-visualizer">
      {renderVisualizer()}
    </div>
  );
};

export default CancerVisualizerFactory;
