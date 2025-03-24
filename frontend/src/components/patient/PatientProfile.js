import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const PatientProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    contactNumber: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const res = await axios.get('/api/v1/patients/me');
        
        // Populate form data with existing profile data
        if (res.data.data) {
          const patient = res.data.data;
          setFormData({
            dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.substring(0, 10) : '',
            gender: patient.gender || '',
            bloodType: patient.bloodType || '',
            height: patient.height || '',
            weight: patient.weight || '',
            contactNumber: patient.contactNumber || '',
            emergencyContact: {
              name: patient.emergencyContact?.name || '',
              relationship: patient.emergencyContact?.relationship || '',
              phone: patient.emergencyContact?.phone || ''
            }
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, []);

  const handleChange = (e) => {
    if (e.target.name.startsWith('emergency')) {
      const field = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [field]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await axios.post('/api/v1/patients', formData);
      alert('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="patient-profile">
      <h2>Patient Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="bloodType">Blood Type</label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Height in cm"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight in kg"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Your contact number"
            />
          </div>
          
          <h4>Emergency Contact</h4>
          <div className="form-group">
            <label htmlFor="emergency.name">Name</label>
            <input
              type="text"
              id="emergency.name"
              name="emergency.name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
              placeholder="Emergency contact name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="emergency.relationship">Relationship</label>
            <input
              type="text"
              id="emergency.relationship"
              name="emergency.relationship"
              value={formData.emergencyContact.relationship}
              onChange={handleChange}
              placeholder="Relationship to you"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="emergency.phone">Phone</label>
            <input
              type="tel"
              id="emergency.phone"
              name="emergency.phone"
              value={formData.emergencyContact.phone}
              onChange={handleChange}
              placeholder="Emergency contact phone"
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default PatientProfile;
