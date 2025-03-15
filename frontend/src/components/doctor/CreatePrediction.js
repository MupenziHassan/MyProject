import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePrediction = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [predictionData, setPredictionData] = useState({
    test: testId,
    condition: '',
    probability: '',
    riskLevel: 'moderate',
    factors: [{ name: '', weight: '' }],
    recommendations: [''],
    notes: ''
  });

  // Fetch test details
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const testRes = await axios.get(`/api/v1/doctors/tests/${testId}`);
        setTest(testRes.data.data);
        
        // Fetch patient details
        if (testRes.data.data && testRes.data.data.patient) {
          try {
            const patientRes = await axios.get(`/api/v1/doctors/patients/${testRes.data.data.patient}`);
            setPatient({
              ...patientRes.data.data.user,
              profile: patientRes.data.data.patientProfile
            });
          } catch (err) {
            setError('Failed to load patient information');
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load test information');
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId]);

  const handleChange = (e) => {
    setPredictionData({
      ...predictionData,
      [e.target.name]: e.target.value
    });
  };

  const handleFactorChange = (index, e) => {
    const updatedFactors = [...predictionData.factors];
    updatedFactors[index] = {
      ...updatedFactors[index],
      [e.target.name]: e.target.value
    };
    
    setPredictionData({
      ...predictionData,
      factors: updatedFactors
    });
  };

  const addFactor = () => {
    setPredictionData({
      ...predictionData,
      factors: [...predictionData.factors, { name: '', weight: '' }]
    });
  };

  const removeFactor = (index) => {
    const updatedFactors = predictionData.factors.filter((_, i) => i !== index);
    setPredictionData({
      ...predictionData,
      factors: updatedFactors
    });
  };

  const handleRecommendationChange = (index, e) => {
    const updatedRecommendations = [...predictionData.recommendations];
    updatedRecommendations[index] = e.target.value;
    
    setPredictionData({
      ...predictionData,
      recommendations: updatedRecommendations
    });
  };

  const addRecommendation = () => {
    setPredictionData({
      ...predictionData,
      recommendations: [...predictionData.recommendations, '']
    });
  };

  const removeRecommendation = (index) => {
    const updatedRecommendations = predictionData.recommendations.filter((_, i) => i !== index);
    setPredictionData({
      ...predictionData,
      recommendations: updatedRecommendations
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Validate probability is a number
      const probValue = parseFloat(predictionData.probability);
      if (isNaN(probValue)) {
        throw new Error('Probability must be a valid number');
      }
      
      // Convert probability to number between 0 and 1
      const formattedData = {
        ...predictionData,
        probability: probValue / 100
      };
      
      await axios.post('/api/v1/doctors/predictions', formattedData);
      navigate(`/doctor/tests/${testId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create prediction');
    }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>;

  // Check if test data is available
  if (!test) {
    return <div className="error-container"><p>Test not found or data couldn't be loaded. Please try again.</p></div>;
  }

  return (
    <div className="create-prediction">
      <div className="card">
        <div className="card-header">
          <h2>Create Health Prediction</h2>
        </div>
        
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="test-summary-card">
            <div className="summary-header">
              <h3>Test Information</h3>
            </div>
            <div className="summary-body">
              <div className="summary-item">
                <span className="label">Test Name:</span>
                <span className="value">{test.name}</span>
              </div>
              <div className="summary-item">
                <span className="label">Patient:</span>
                <span className="value">{patient ? patient.name : 'Unknown'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Test Date:</span>
                <span className="value">{new Date(test.date).toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <span className="label">Status:</span>
                <span className={`test-status status-${test.status}`}>{test.status}</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="form-section">
              <h3 className="section-title">Prediction Details</h3>
              
              <div className="form-group">
                <label htmlFor="condition">Medical Condition</label>
                <input
                  type="text"
                  id="condition"
                  name="condition"
                  value={predictionData.condition}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Cardiovascular Disease, Diabetes"
                  className="form-control"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="probability">Probability (%)</label>
                  <input
                    type="number"
                    id="probability"
                    name="probability"
                    value={predictionData.probability}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    placeholder="0-100"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group col-md-6">
                  <label htmlFor="riskLevel">Risk Level</label>
                  <select
                    id="riskLevel"
                    name="riskLevel"
                    value={predictionData.riskLevel}
                    onChange={handleChange}
                    required
                    className="form-control"
                  >
                    <option value="low">Low Risk</option>
                    <option value="moderate">Moderate Risk</option>
                    <option value="high">High Risk</option>
                    <option value="very high">Very High Risk</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3 className="section-title">Contributing Factors</h3>
              
              {predictionData.factors.map((factor, index) => (
                <div key={index} className="factor-card">
                  <div className="factor-header">
                    <h4>Factor {index + 1}</h4>
                    {predictionData.factors.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeFactor(index)}
                      >
                        <i className="fas fa-trash-alt"></i> Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group col-md-8">
                      <label htmlFor={`factor-name-${index}`}>Name</label>
                      <input
                        type="text"
                        id={`factor-name-${index}`}
                        name="name"
                        value={factor.name}
                        onChange={(e) => handleFactorChange(index, e)}
                        required
                        placeholder="e.g., High Blood Pressure, Family History"
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group col-md-4">
                      <label htmlFor={`factor-weight-${index}`}>Weight (%)</label>
                      <input
                        type="number"
                        id={`factor-weight-${index}`}
                        name="weight"
                        value={factor.weight}
                        onChange={(e) => handleFactorChange(index, e)}
                        required
                        min="0"
                        max="100"
                        placeholder="Contribution percentage"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button type="button" className="btn btn-secondary" onClick={addFactor}>
                <i className="fas fa-plus"></i> Add Factor
              </button>
            </div>
            
            <div className="form-section">
              <h3 className="section-title">Recommendations</h3>
              
              {predictionData.recommendations.map((recommendation, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <h4>Recommendation {index + 1}</h4>
                    {predictionData.recommendations.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeRecommendation(index)}
                      >
                        <i className="fas fa-trash-alt"></i> Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <textarea
                      id={`recommendation-${index}`}
                      value={recommendation}
                      onChange={(e) => handleRecommendationChange(index, e)}
                      required
                      rows="2"
                      placeholder="Recommendation for patient"
                      className="form-control"
                    ></textarea>
                  </div>
                </div>
              ))}
              
              <button type="button" className="btn btn-secondary" onClick={addRecommendation}>
                <i className="fas fa-plus"></i> Add Recommendation
              </button>
            </div>
            
            <div className="form-section">
              <h3 className="section-title">Additional Notes</h3>
              <div className="form-group">
                <textarea
                  id="notes"
                  name="notes"
                  value={predictionData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes or observations"
                  className="form-control"
                ></textarea>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/doctor/tests/${testId}`)}>
                <i className="fas fa-times"></i> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i> Create Prediction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePrediction;
