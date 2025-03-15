import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MedicationReminder = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingMed, setAddingMed] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    timeOfDay: [],
    instructions: '',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '',
    refillReminder: false,
    refillDate: ''
  });

  // Check if mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch medications data
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/patients/medications');
        
        // Sort medications by next due time
        const sortedMeds = res.data.data.sort((a, b) => {
          const aNextDue = new Date(a.nextDue || a.startDate);
          const bNextDue = new Date(b.nextDue || b.startDate);
          return aNextDue - bNextDue;
        });
        
        setMedications(sortedMeds);
        setLoading(false);
      } catch (err) {
        setError('Failed to load medications');
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMedication(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle time of day selection
  const handleTimeOfDayChange = (time) => {
    setNewMedication(prev => {
      const timeOfDay = [...prev.timeOfDay];
      
      if (timeOfDay.includes(time)) {
        return {
          ...prev,
          timeOfDay: timeOfDay.filter(t => t !== time)
        };
      } else {
        return {
          ...prev,
          timeOfDay: [...timeOfDay, time]
        };
      }
    });
  };

  // Submit new medication
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/patients/medications', newMedication);
      
      // Refetch medications to update list
      const res = await axios.get('/api/v1/patients/medications');
      setMedications(res.data.data);
      
      // Reset form and close modal
      setNewMedication({
        name: '',
        dosage: '',
        frequency: 'daily',
        timeOfDay: [],
        instructions: '',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: '',
        refillReminder: false,
        refillDate: ''
      });
      setAddingMed(false);
    } catch (err) {
      setError('Failed to save medication');
    }
  };

  // Mark medication as taken
  const markAsTaken = async (medicationId) => {
    try {
      await axios.post(`/api/v1/patients/medications/${medicationId}/taken`);
      
      // Update medication status locally
      setMedications(prevMeds => 
        prevMeds.map(med => 
          med._id === medicationId 
            ? { ...med, lastTaken: new Date(), status: 'taken' } 
            : med
        )
      );
    } catch (err) {
      setError('Failed to update medication status');
    }
  };

  // Format frequency for display
  const formatFrequency = (frequency, timeOfDay) => {
    let frequencyText = '';
    
    switch (frequency) {
      case 'daily':
        frequencyText = 'Daily';
        break;
      case 'twice_daily':
        frequencyText = 'Twice daily';
        break;
      case 'three_times_daily':
        frequencyText = '3 times daily';
        break;
      case 'four_times_daily':
        frequencyText = '4 times daily';
        break;
      case 'weekly':
        frequencyText = 'Weekly';
        break;
      case 'monthly':
        frequencyText = 'Monthly';
        break;
      default:
        frequencyText = frequency;
    }
    
    if (timeOfDay && timeOfDay.length > 0) {
      frequencyText += ' (' + timeOfDay.join(', ') + ')';
    }
    
    return frequencyText;
  };

  // Check if a medication is due soon (within next hour)
  const isDueSoon = (medication) => {
    if (!medication.nextDue) return false;
    
    const nextDue = new Date(medication.nextDue);
    const now = new Date();
    const oneHour = 60 * 60 * 1000; // ms
    
    return nextDue > now && nextDue - now < oneHour;
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="medication-reminder">
      <div className="reminder-header">
        <h2>Medication Reminders</h2>
        <button 
          className="btn btn-primary add-med-btn"
          onClick={() => setAddingMed(true)}
        >
          <i className="fas fa-plus"></i> {isMobile ? '' : 'Add Medication'}
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="due-medications">
        <h3>Due Today</h3>
        
        {medications.filter(med => med.status === 'due').length === 0 ? (
          <div className="no-medications">
            <i className="fas fa-check-circle"></i>
            <p>No medications due right now</p>
          </div>
        ) : (
          <div className={`medication-list ${isMobile ? 'mobile-list' : ''}`}>
            {medications
              .filter(med => med.status === 'due')
              .map(medication => (
                <div 
                  key={medication._id} 
                  className={`medication-card ${isDueSoon(medication) ? 'due-soon' : ''}`}
                >
                  <div className="med-info">
                    <h4>{medication.name}</h4>
                    <p className="med-dosage">{medication.dosage}</p>
                    <p className="med-time">
                      <i className="far fa-clock"></i>
                      {medication.nextDue ? new Date(medication.nextDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time not set'}
                    </p>
                    <p className="med-frequency">
                      <i className="far fa-calendar-alt"></i>
                      {formatFrequency(medication.frequency, medication.timeOfDay)}
                    </p>
                  </div>
                  <div className="med-actions">
                    <button 
                      className="btn btn-success take-med-btn"
                      onClick={() => markAsTaken(medication._id)}
                    >
                      <i className="fas fa-check"></i>
                      <span>Taken</span>
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
      
      <div className="all-medications">
        <h3>All Medications</h3>
        
        {medications.length === 0 ? (
          <div className="no-medications">
            <i className="fas fa-pills"></i>
            <p>No medications added yet</p>
          </div>
        ) : (
          <div className={`medication-table-container ${isMobile ? 'mobile-view' : ''}`}>
            {isMobile ? (
              <div className="medication-cards">
                {medications.map(medication => (
                  <div key={medication._id} className="medication-card">
                    <h4>{medication.name}</h4>
                    <p className="med-dosage">{medication.dosage}</p>
                    <p className="med-frequency">
                      {formatFrequency(medication.frequency, medication.timeOfDay)}
                    </p>
                    <p className="med-status">
                      Status: <span className={`status-${medication.status}`}>
                        {medication.status === 'due' ? 'Due' : 'Taken'}
                      </span>
                    </p>
                    {medication.instructions && (
                      <p className="med-instructions">{medication.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <table className="medications-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Status</th>
                    <th>Last Taken</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map(medication => (
                    <tr key={medication._id}>
                      <td>{medication.name}</td>
                      <td>{medication.dosage}</td>
                      <td>{formatFrequency(medication.frequency, medication.timeOfDay)}</td>
                      <td>
                        <span className={`status-${medication.status}`}>
                          {medication.status === 'due' ? 'Due' : 'Taken'}
                        </span>
                      </td>
                      <td>{medication.lastTaken ? new Date(medication.lastTaken).toLocaleString() : 'Not taken yet'}</td>
                      <td>{medication.instructions || 'No special instructions'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      
      {/* Add New Medication Modal */}
      {addingMed && (
        <div className="modal show-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Medication</h3>
              <button 
                className="close-btn" 
                onClick={() => setAddingMed(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Medication Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newMedication.name}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="dosage">Dosage</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={newMedication.dosage}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  placeholder="e.g., 10mg, 1 tablet"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="frequency">Frequency</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={newMedication.frequency}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="three_times_daily">Three Times Daily</option>
                  <option value="four_times_daily">Four Times Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Time of Day</label>
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="morning"
                      checked={newMedication.timeOfDay.includes('morning')}
                      onChange={() => handleTimeOfDayChange('morning')}
                    />
                    <label htmlFor="morning">Morning</label>
                  </div>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="afternoon"
                      checked={newMedication.timeOfDay.includes('afternoon')}
                      onChange={() => handleTimeOfDayChange('afternoon')}
                    />
                    <label htmlFor="afternoon">Afternoon</label>
                  </div>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="evening"
                      checked={newMedication.timeOfDay.includes('evening')}
                      onChange={() => handleTimeOfDayChange('evening')}
                    />
                    <label htmlFor="evening">Evening</label>
                  </div>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="bedtime"
                      checked={newMedication.timeOfDay.includes('bedtime')}
                      onChange={() => handleTimeOfDayChange('bedtime')}
                    />
                    <label htmlFor="bedtime">Bedtime</label>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={newMedication.startDate}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-group col-md-6">
                  <label htmlFor="endDate">End Date (Optional)</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={newMedication.endDate}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="instructions">Special Instructions</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  value={newMedication.instructions}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="2"
                  placeholder="e.g., Take with food"
                />
              </div>
              
              <div className="form-group refill-reminder">
                <input
                  type="checkbox"
                  id="refillReminder"
                  name="refillReminder"
                  checked={newMedication.refillReminder}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label htmlFor="refillReminder">Set Refill Reminder</label>
              </div>
              
              {newMedication.refillReminder && (
                <div className="form-group">
                  <label htmlFor="refillDate">Refill Reminder Date</label>
                  <input
                    type="date"
                    id="refillDate"
                    name="refillDate"
                    value={newMedication.refillDate}
                    onChange={handleInputChange}
                    className="form-control"
                    required={newMedication.refillReminder}
                  />
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setAddingMed(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationReminder;
