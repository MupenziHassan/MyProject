import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const DoctorProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    specialization: '',
    licenseNumber: '',
    experience: '',
    contactNumber: '',
    officeAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    qualifications: [{ degree: '', institution: '', year: '' }]
  });

  // Fetch doctor profile on component mount
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const res = await axios.get('/api/v1/doctors/me');
        setProfile(res.data.data);
        
        // Populate form data with existing profile data
        if (res.data.data) {
          const doctor = res.data.data;
          setFormData({
            specialization: doctor.specialization || '',
            licenseNumber: doctor.licenseNumber || '',
            experience: doctor.experience || '',
            contactNumber: doctor.contactNumber || '',
            officeAddress: {
              street: doctor.officeAddress?.street || '',
              city: doctor.officeAddress?.city || '',
              state: doctor.officeAddress?.state || '',
              zipCode: doctor.officeAddress?.zipCode || '',
              country: doctor.officeAddress?.country || ''
            },
            qualifications: doctor.qualifications?.length > 0 ? 
              doctor.qualifications : 
              [{ degree: '', institution: '', year: '' }]
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleChange = (e) => {
    if (e.target.name.startsWith('address.')) {
      const field = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        officeAddress: {
          ...formData.officeAddress,
          [field]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleQualificationChange = (index, e) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications[index] = {
      ...updatedQualifications[index],
      [e.target.name]: e.target.value
    };
    
    setFormData({
      ...formData,
      qualifications: updatedQualifications
    });
  };

  const addQualification = () => {
    setFormData({
      ...formData,
      qualifications: [...formData.qualifications, { degree: '', institution: '', year: '' }]
    });
  };

  const removeQualification = (index) => {
    const updatedQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      qualifications: updatedQualifications
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.post('/api/v1/doctors', formData);
      setProfile(res.data.data);
      setSuccess('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="doctor-profile">
      <h2>Doctor Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Professional Information</h3>
          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              placeholder="e.g., Cardiology, Neurology"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="licenseNumber">License Number</label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
              placeholder="Medical License Number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="experience">Years of Experience</label>
            <input
              type="number"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              placeholder="Years of professional experience"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Qualifications</h3>
          {formData.qualifications.map((qual, index) => (
            <div key={index} className="qualification-item">
              <div className="qualification-header">
                <h4>Qualification {index + 1}</h4>
                {formData.qualifications.length > 1 && (
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm" 
                    onClick={() => removeQualification(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`degree-${index}`}>Degree</label>
                  <input
                    type="text"
                    id={`degree-${index}`}
                    name="degree"
                    value={qual.degree}
                    onChange={(e) => handleQualificationChange(index, e)}
                    placeholder="e.g., MD, PhD"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`institution-${index}`}>Institution</label>
                  <input
                    type="text"
                    id={`institution-${index}`}
                    name="institution"
                    value={qual.institution}
                    onChange={(e) => handleQualificationChange(index, e)}
                    placeholder="Institution name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`year-${index}`}>Year</label>
                  <input
                    type="number"
                    id={`year-${index}`}
                    name="year"
                    value={qual.year}
                    onChange={(e) => handleQualificationChange(index, e)}
                    placeholder="Year of completion"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button type="button" className="btn btn-secondary" onClick={addQualification}>
            Add Qualification
          </button>
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
              placeholder="Professional contact number"
            />
          </div>
          
          <h4>Office Address</h4>
          <div className="form-group">
            <label htmlFor="address.street">Street</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.officeAddress.street}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address.city">City</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.officeAddress.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.state">State/Province</label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.officeAddress.state}
                onChange={handleChange}
                placeholder="State or Province"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address.zipCode">Zip/Postal Code</label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.officeAddress.zipCode}
                onChange={handleChange}
                placeholder="Zip or postal code"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.country">Country</label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={formData.officeAddress.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default DoctorProfile;
