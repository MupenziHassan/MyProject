import React from 'react';
import { render, screen } from '@testing-library/react';
import PredictionVisualizer from './PredictionVisualizer';

describe('PredictionVisualizer Component', () => {
  const mockPrediction = {
    probability: 0.75,
    riskLevel: 'high',
    factors: [
      { name: 'Age', impact: 0.3 },
      { name: 'Family History', impact: 0.25 },
      { name: 'Genetic Markers', impact: 0.45 }
    ],
    condition: 'Breast Cancer',
    timestamp: new Date().toISOString()
  };

  it('renders prediction details correctly', () => {
    render(<PredictionVisualizer prediction={mockPrediction} />);
    
    // Check that key information is displayed
    expect(screen.getByText('High Risk')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Breast Cancer')).toBeInTheDocument();
  });

  it('displays all contributing factors', () => {
    render(<PredictionVisualizer prediction={mockPrediction} />);
    
    // Check that all factors are displayed
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Family History')).toBeInTheDocument();
    expect(screen.getByText('Genetic Markers')).toBeInTheDocument();
  });

  it('renders appropriate risk level styling', () => {
    const { container } = render(<PredictionVisualizer prediction={mockPrediction} />);
    
    // Check that high risk styling is applied
    const riskElement = container.querySelector('.risk-level-high');
    expect(riskElement).toBeInTheDocument();
  });

  it('handles missing data gracefully', () => {
    const incompletePrediction = {
      probability: 0.3,
      riskLevel: 'low'
      // Missing other fields
    };
    
    render(<PredictionVisualizer prediction={incompletePrediction} />);
    
    // Should still render without crashing
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });
});
