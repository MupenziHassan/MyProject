import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LifestyleForm = () => {
  const [lifestyle, setLifestyle] = useState({
    smokingStatus: 'never',
    smokingFrequency: '',
    alcoholConsumption: 'none',
    exerciseFrequency: 'none',
    dietType: 'regular'
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLifestyle = async () => {
      try {
        const res = await axios.get('/api/v1/patients/me');
        if (res.data.data && res.data.data.lifestyle) {
          setLifestyle(res.data.data.lifestyle);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load lifestyle information');
        setLoading(false);
      }
    };

    fetchLifestyle();
  }, []);

  const handleChange = (e) => {
    setLifestyle({
      ...lifestyle,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      await axios.put('/api/v1/patients/lifestyle', lifestyle);
      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update lifestyle information');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="lifestyle-form">
      <h2>Lifestyle Information</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Lifestyle information updated successfully</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Smoking Habits</h3>
          <div className="form-group">
            <label htmlFor="smokingStatus">Smoking Status</label>
            <select
              id="smokingStatus"
              name="smokingStatus"
              value={lifestyle.smokingStatus}
              onChange={handleChange}
            >
              <option value="never">Never smoked</option>
              <option value="former">Former smoker</option>
              <option value="current">Current smoker</option>
              <option value="passive">Passive smoker</option>
            </select>
          </div>
          
          {(lifestyle.smokingStatus === 'current' || lifestyle.smokingStatus === 'former') && (
            <div className="form-group">
              <label htmlFor="smokingFrequency">Frequency/Amount</label>
              <input
                type="text"
                id="smokingFrequency"
                name="smokingFrequency"
                value={lifestyle.smokingFrequency}
                onChange={handleChange}
                placeholder="e.g., 5 cigarettes per day, 10 years"
              />
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h3>Alcohol Consumption</h3>
          <div className="form-group">
            <label htmlFor="alcoholConsumption">Alcohol Consumption</label>
            <select
              id="alcoholConsumption"
              name="alcoholConsumption"
              value={lifestyle.alcoholConsumption}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="occasional">Occasional (few times a month)</option>
              <option value="moderate">Moderate (few times a week)</option>
              <option value="heavy">Heavy (daily)</option>
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Exercise Habits</h3>
          <div className="form-group">
            <label htmlFor="exerciseFrequency">Exercise Frequency</label>
            <select
              id="exerciseFrequency"
              name="exerciseFrequency"
              value={lifestyle.exerciseFrequency}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="light">Light (1-2 times a week)</option>
              <option value="moderate">Moderate (3-4 times a week)</option>
              <option value="active">Active (5+ times a week)</option>
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Diet Information</h3>
          <div className="form-group">
            <label htmlFor="dietType">Diet Type</label>
            <select
              id="dietType"
              name="dietType"
              value={lifestyle.dietType}
              onChange={handleChange}
            >
              <option value="regular">Regular</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="keto">Keto</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          Save Lifestyle Information
        </button>
      </form>
    </div>
  );
};

export default LifestyleForm;
