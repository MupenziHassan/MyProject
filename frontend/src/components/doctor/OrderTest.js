import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderTest = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [testData, setTestData] = useState({
    name: '',
    description: '',
    notes: '',
    patient: patientId,
    status: 'ordered'
  });

  // Available test types
  const testTypes = [
    { id: 'blood_panel', name: 'Complete Blood Panel' },
    { id: 'lipid_profile', name: 'Lipid Profile' },
    { id: 'glucose_test', name: 'Blood Glucose Test' },
    { id: 'liver_function', name: 'Liver Function Test' },
    { id: 'kidney_function', name: 'Kidney Function Test' },
    { id: 'thyroid_panel', name: 'Thyroid Panel' },
    { id: 'cardiac_enzymes', name: 'Cardiac Enzymes' },
    { id: 'vitamin_levels', name: 'Vitamin Levels' },
    { id: 'hormone_panel', name: 'Hormone Panel' },
    { id: 'custom', name: 'Custom Test' }
  ];

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`/api/v1/doctors/patients/${patientId}`);
        setPatient({
          ...res.data.data.user,
          profile: res.data.data.patientProfile
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load patient information');
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleChange = (e) => {
    setTestData({
      ...testData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectTest = (testType) => {
    if (testType.id === 'custom') {
      setTestData({
        ...testData,
        name: '',
        description: ''
      });
    } else {
      setTestData({
        ...testData,
        name: testType.name,
        description: `Standard ${testType.name} to evaluate patient health parameters`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await axios.post('/api/v1/doctors/tests', testData);
      navigate(`/doctor/patients/${patientId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to order test');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="order-test">
      <h2>Order Test</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="patient-summary">
        <h3>Patient: {patient.name}</h3>
        <p>Email: {patient.email}</p>
        {patient.profile && (
          <>
            <p>Gender: {patient.profile.gender}</p>
            <p>Age: {patient.profile.dateOfBirth && new Date().getFullYear() - new Date(patient.profile.dateOfBirth).getFullYear()}</p>
          </>
        )}
      </div>
      
      <div className="test-type-selector">
        <h3>Select Test Type</h3>
        <div className="test-type-buttons">
          {testTypes.map((testType) => (
            <button
              key={testType.id}
              type="button"
              className={`test-type-button ${testData.name === testType.name ? 'active' : ''}`}
              onClick={() => handleSelectTest(testType)}
            >
              {testType.name}
            </button>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="test-form">
        <div className="form-group">
          <label htmlFor="name">Test Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={testData.name}
            onChange={handleChange}
            required
            placeholder="Enter test name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={testData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe the test purpose and requirements"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={testData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Any special instructions for the patient or lab"
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/doctor/patients/${patientId}`)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Order Test
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderTest;
