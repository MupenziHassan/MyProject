import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

const MedicalHistoryForm = () => {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [familyHistory, setFamilyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [medicalCondition, setMedicalCondition] = useState({
    condition: '',
    diagnosedDate: '',
    medications: '',
    notes: ''
  });
  
  const [allergyData, setAllergyData] = useState({
    allergen: '',
    reaction: '',
    severity: 'mild'
  });
  
  const [familyCondition, setFamilyCondition] = useState({
    condition: '',
    relationship: ''
  });

  // Fetch patient data
  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const res = await axios.get('/api/v1/patients/me');
        if (res.data.data) {
          setMedicalHistory(res.data.data.medicalHistory || []);
          setAllergies(res.data.data.allergies || []);
          setFamilyHistory(res.data.data.familyHistory || []);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load medical history');
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, []);

  // Handle medical condition
  const handleMedicalConditionChange = (e) => {
    setMedicalCondition({
      ...medicalCondition,
      [e.target.name]: e.target.value
    });
  };

  const addMedicalCondition = async (e) => {
    e.preventDefault();
    
    // Format medications as array
    const formattedCondition = {
      ...medicalCondition,
      medications: medicalCondition.medications.split(',').map(med => med.trim())
    };
    
    try {
      const res = await axios.post('/api/v1/patients/medical-history', formattedCondition);
      setMedicalHistory(res.data.data);
      setMedicalCondition({
        condition: '',
        diagnosedDate: '',
        medications: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add medical condition');
    }
  };

  // Handle allergies
  const handleAllergyChange = (e) => {
    setAllergyData({
      ...allergyData,
      [e.target.name]: e.target.value
    });
  };

  const addAllergy = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/patients/allergies', allergyData);
      setAllergies(res.data.data);
      setAllergyData({
        allergen: '',
        reaction: '',
        severity: 'mild'
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add allergy');
    }
  };

  // Handle family history
  const handleFamilyHistoryChange = (e) => {
    setFamilyCondition({
      ...familyCondition,
      [e.target.name]: e.target.value
    });
  };

  const addFamilyHistory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/patients/family-history', familyCondition);
      setFamilyHistory(res.data.data);
      setFamilyCondition({
        condition: '',
        relationship: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add family history');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="medical-history">
      <h2>Medical History</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="medical-history-section">
        <h3>Medical Conditions</h3>
        <div className="medical-conditions-list">
          {medicalHistory.length === 0 ? (
            <p>No medical conditions added yet.</p>
          ) : (
            <ul>
              {medicalHistory.map((condition, index) => (
                <li key={index} className="medical-condition-item">
                  <div className="condition-header">
                    <h4>{condition.condition}</h4>
                    <span>Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="condition-details">
                    <p><strong>Medications:</strong> {condition.medications.join(', ')}</p>
                    {condition.notes && <p><strong>Notes:</strong> {condition.notes}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={addMedicalCondition} className="add-condition-form">
          <h4>Add Medical Condition</h4>
          <div className="form-group">
            <label htmlFor="condition">Condition Name</label>
            <input
              type="text"
              id="condition"
              name="condition"
              value={medicalCondition.condition}
              onChange={handleMedicalConditionChange}
              required
              placeholder="e.g., Hypertension, Diabetes"
            />
          </div>

          <div className="form-group">
            <label htmlFor="diagnosedDate">Date Diagnosed</label>
            <input
              type="date"
              id="diagnosedDate"
              name="diagnosedDate"
              value={medicalCondition.diagnosedDate}
              onChange={handleMedicalConditionChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="medications">Medications (comma separated)</label>
            <input
              type="text"
              id="medications"
              name="medications"
              value={medicalCondition.medications}
              onChange={handleMedicalConditionChange}
              placeholder="e.g., Metformin, Lisinopril"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={medicalCondition.notes}
              onChange={handleMedicalConditionChange}
              placeholder="Any additional information"
              rows="3"
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Add Condition
          </button>
        </form>
      </div>

      <div className="allergies-section">
        <h3>Allergies</h3>
        <div className="allergies-list">
          {allergies.length === 0 ? (
            <p>No allergies added yet.</p>
          ) : (
            <ul>
              {allergies.map((allergy, index) => (
                <li key={index} className="allergy-item">
                  <span className={`severity-badge ${allergy.severity}`}>{allergy.severity}</span>
                  <strong>{allergy.allergen}</strong>: {allergy.reaction}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={addAllergy} className="add-allergy-form">
          <h4>Add Allergy</h4>
          <div className="form-group">
            <label htmlFor="allergen">Allergen</label>
            <input
              type="text"
              id="allergen"
              name="allergen"
              value={allergyData.allergen}
              onChange={handleAllergyChange}
              required
              placeholder="e.g., Peanuts, Penicillin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reaction">Reaction</label>
            <input
              type="text"
              id="reaction"
              name="reaction"
              value={allergyData.reaction}
              onChange={handleAllergyChange}
              required
              placeholder="e.g., Rash, Difficulty breathing"
            />
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity</label>
            <select
              id="severity"
              name="severity"
              value={allergyData.severity}
              onChange={handleAllergyChange}
              required
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Add Allergy
          </button>
        </form>
      </div>

      <div className="family-history-section">
        <h3>Family History</h3>
        <div className="family-history-list">
          {familyHistory.length === 0 ? (
            <p>No family history added yet.</p>
          ) : (
            <ul>
              {familyHistory.map((item, index) => (
                <li key={index} className="family-history-item">
                  <strong>{item.condition}</strong> - {item.relationship}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={addFamilyHistory} className="add-family-history-form">
          <h4>Add Family History</h4>
          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <input
              type="text"
              id="condition"
              name="condition"
              value={familyCondition.condition}
              onChange={handleFamilyHistoryChange}
              required
              placeholder="e.g., Heart Disease, Cancer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="relationship">Relationship</label>
            <input
              type="text"
              id="relationship"
              name="relationship"
              value={familyCondition.relationship}
              onChange={handleFamilyHistoryChange}
              required
              placeholder="e.g., Mother, Father, Sibling"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Add Family History
          </button>
        </form>
      </div>
    </div>
  );
};

export default MedicalHistoryForm;
