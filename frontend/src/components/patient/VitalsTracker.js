import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VitalsTracker = () => {
  const [vitalsData, setVitalsData] = useState({
    blood_pressure: [],
    heart_rate: [],
    temperature: [],
    oxygen_level: [],
    weight: []
  });
  const [selectedVital, setSelectedVital] = useState('heart_rate');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch vitals data
  useEffect(() => {
    const fetchVitalsData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/patients/vitals');
        setVitalsData(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vitals data');
        setLoading(false);
      }
    };
    
    fetchVitalsData();
  }, []);

  // Prepare chart data based on selected vital
  const prepareChartData = () => {
    if (!vitalsData || !vitalsData[selectedVital] || vitalsData[selectedVital].length === 0) {
      return {
        labels: [],
        datasets: [{
          label: getVitalLabel(selectedVital),
          data: [],
          borderColor: getVitalColor(selectedVital),
          backgroundColor: getVitalColor(selectedVital, 0.5),
        }]
      };
    }

    if (selectedVital === 'blood_pressure') {
      return {
        labels: vitalsData.blood_pressure.map(bp => new Date(bp.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Systolic',
            data: vitalsData.blood_pressure.map(bp => bp.values && bp.values.systolic ? bp.values.systolic : null),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Diastolic',
            data: vitalsData.blood_pressure.map(bp => bp.values && bp.values.diastolic ? bp.values.diastolic : null),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ]
      };
    } else {
      return {
        labels: vitalsData[selectedVital].map(item => new Date(item.date).toLocaleDateString()),
        datasets: [
          {
            label: getVitalLabel(selectedVital),
            data: vitalsData[selectedVital].map(item => item.value),
            borderColor: getVitalColor(selectedVital),
            backgroundColor: getVitalColor(selectedVital, 0.5),
          }
        ]
      };
    }
  };

  // Helper functions for labels and colors
  const getVitalLabel = (vitalType) => {
    const labels = {
      heart_rate: 'Heart Rate (BPM)',
      blood_pressure: 'Blood Pressure (mmHg)',
      temperature: 'Body Temperature (°F)',
      oxygen_level: 'Oxygen Saturation (%)',
      weight: 'Weight (kg)'
    };
    return labels[vitalType] || vitalType;
  };

  const getVitalColor = (vitalType, alpha = 1) => {
    const colors = {
      heart_rate: `rgba(255, 99, 132, ${alpha})`,
      blood_pressure: `rgba(54, 162, 235, ${alpha})`,
      temperature: `rgba(255, 206, 86, ${alpha})`,
      oxygen_level: `rgba(75, 192, 192, ${alpha})`,
      weight: `rgba(153, 102, 255, ${alpha})`
    };
    return colors[vitalType] || `rgba(201, 203, 207, ${alpha})`;
  };

  return (
    <div className="vitals-tracker">
      <h2>Health Vitals Tracker</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="vital-selector">
        <button 
          className={`vital-btn ${selectedVital === 'heart_rate' ? 'active' : ''}`}
          onClick={() => setSelectedVital('heart_rate')}>
          Heart Rate
        </button>
        <button 
          className={`vital-btn ${selectedVital === 'blood_pressure' ? 'active' : ''}`}
          onClick={() => setSelectedVital('blood_pressure')}>
          Blood Pressure
        </button>
        <button 
          className={`vital-btn ${selectedVital === 'temperature' ? 'active' : ''}`}
          onClick={() => setSelectedVital('temperature')}>
          Temperature
        </button>
        <button 
          className={`vital-btn ${selectedVital === 'oxygen_level' ? 'active' : ''}`}
          onClick={() => setSelectedVital('oxygen_level')}>
          Oxygen Level
        </button>
        <button 
          className={`vital-btn ${selectedVital === 'weight' ? 'active' : ''}`}
          onClick={() => setSelectedVital('weight')}>
          Weight
        </button>
      </div>
      
      <div className="vitals-chart">
        {loading ? (
          <div className="loading-spinner">Loading data...</div>
        ) : (
          <Line data={prepareChartData()} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: getVitalLabel(selectedVital),
              },
            },
          }} />
        )}
      </div>
    </div>
  );
};

export default VitalsTracker;
