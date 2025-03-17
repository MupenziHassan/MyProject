import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../../styles/AppointmentBooking.css';

const EnhancedAppointmentBooking = ({ doctorId: propDoctorId, predictionId, testId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filterByDistance, setFilterByDistance] = useState(false);
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'in-person',
    location: '',
    meetingLink: '',
    reason: predictionId ? 'Follow-up on risk assessment' : (testId ? 'Discuss test results' : ''),
    healthSummary: '',
    priorityLevel: 'normal',
    symptoms: []
  });
  const [symptomInput, setSymptomInput] = useState('');

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // If doctor ID is provided in props, fetch that specific doctor
        if (propDoctorId) {
          const res = await axios.get(`/api/v1/doctors/${propDoctorId}`);
          setDoctors([res.data.data]);
          setSelectedDoctor(res.data.data);
          fetchAvailability(res.data.data._id);
        } else {
          // Otherwise fetch all available doctors
          const res = await axios.get('/api/v1/doctors/available');
          setDoctors(res.data.data);
          
          // Extract unique specializations
          const specs = [...new Set(res.data.data.map(doctor => doctor.specialization))];
          setSpecializations(specs);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load doctors. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, [propDoctorId]);

  // Fetch availability when a doctor is selected
  const fetchAvailability = async (doctorId) => {
    try {
      setLoading(true);
      
      // Get next 30 days of availability
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const res = await axios.get(`/api/v1/appointments/availability/${doctorId}`, {
        params: {
          startDate: new Date().toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      // Transform availability data into date objects for DatePicker
      const dates = res.data.data.map(slot => new Date(slot.date));
      setAvailableDates(dates);
      setSelectedDate(null);
      setTimeSlots([]);
      setSelectedSlot(null);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load doctor availability.');
      setLoading(false);
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    fetchAvailability(doctor._id);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchTimeSlotsForDate(selectedDoctor._id, date);
  };

  // Fetch time slots for a specific date
  const fetchTimeSlotsForDate = async (doctorId, date) => {
    try {
      setLoading(true);
      
      const dateStr = date.toISOString().split('T')[0];
      
      const res = await axios.get(`/api/v1/appointments/availability/${doctorId}/slots`, {
        params: { date: dateStr }
      });
      
      // Transform time slots data
      const slots = res.data.data.map(slot => ({
        id: slot._id,
        startTime: new Date(slot.start),
        endTime: new Date(slot.end),
        formattedTime: `${new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(slot.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      }));
      
      setTimeSlots(slots);
      setSelectedSlot(null);
      setLoading(false);
    } catch (err) {
      setError('Failed to load time slots.');
      setLoading(false);
    }
  };

  // Handle time slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedSlot) {
      setError('Please select a doctor and time slot');
      return;
    }
    
    try {
      setLoading(true);
      
      const appointmentData = {
        doctorId: selectedDoctor._id,
        date: selectedSlot.startTime.toISOString(),
        duration: (selectedSlot.endTime - selectedSlot.startTime) / (1000 * 60), // Duration in minutes
        ...formData,
        predictionId,
        testId
      };
      
      const res = await axios.post('/api/v1/appointments', appointmentData);
      
      setLoading(false);
      
      // Redirect to appointments page or show success message
      navigate('/patient/appointments', { 
        state: { 
          success: true, 
          message: 'Appointment booked successfully',
          appointmentId: res.data.data._id
        } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
      setLoading(false);
    }
  };

  // Handle adding a symptom
  const handleAddSymptom = () => {
    if (symptomInput.trim() && !formData.symptoms.includes(symptomInput.trim())) {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, symptomInput.trim()]
      });
      setSymptomInput('');
    }
  };

  // Handle removing a symptom
  const handleRemoveSymptom = (symptom) => {
    setFormData({
      ...formData,
      symptoms: formData.symptoms.filter(s => s !== symptom)
    });
  };

  // Filter doctors based on specialization
  const filteredDoctors = selectedSpecialization
    ? doctors.filter(doctor => doctor.specialization === selectedSpecialization)
    : doctors;

  return (
    <div className="appointment-booking-container">
      <div className="booking-header">
        <h2>Book an Appointment</h2>
        {selectedDoctor && (
          <div className="doctor-info">
            <div className="doctor-avatar">
              {selectedDoctor.user?.name ? selectedDoctor.user.name.charAt(0) : 'D'}
            </div>
            <div className="doctor-details">
              <h3>Dr. {selectedDoctor.user?.name || 'Unknown'}</h3>
              <p className="specialization">{selectedDoctor.specialization || 'Doctor'}</p>
            </div>
          </div>
        )}
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="booking-form">
        {!propDoctorId && (
          <div className="form-section doctor-selection-section">
            <h3>1. Select a Doctor</h3>
            
            <div className="doctor-filters">
              <div className="form-group">
                <label htmlFor="specialization">Filter by Specialization</label>
                <select
                  id="specialization"
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="form-control"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec, index) => (
                    <option key={index} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-toggles">
                <label className="toggle-container">
                  <input
                    type="checkbox"
                    checked={filterByDistance}
                    onChange={() => setFilterByDistance(!filterByDistance)}
                  />
                  <span className="toggle-text">Nearby First</span>
                </label>
                
                <label className="toggle-container">
                  <input
                    type="checkbox"
                    checked={showVirtualOnly}
                    onChange={() => setShowVirtualOnly(!showVirtualOnly)}
                  />
                  <span className="toggle-text">Virtual Appointments Only</span>
                </label>
              </div>
            </div>
            
            <div className="doctors-list">
              {loading ? (
                <div className="loading">Loading doctors...</div>
              ) : filteredDoctors.length === 0 ? (
                <div className="no-doctors">
                  <p>No doctors available with the selected criteria.</p>
                </div>
              ) : (
                filteredDoctors.map(doctor => (
                  <div
                    key={doctor._id}
                    className={`doctor-card ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="doctor-card-avatar">
                      {doctor.user?.name ? doctor.user.name.charAt(0) : 'D'}
                    </div>
                    <div className="doctor-card-info">
                      <h4>Dr. {doctor.user?.name || 'Unknown'}</h4>
                      <p>{doctor.specialization}</p>
                      {doctor.experience && (
                        <span className="experience-badge">{doctor.experience} years exp.</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        <div className="form-section date-picker-section">
          <h3>{propDoctorId ? '1. Select Date' : '2. Select Date'}</h3>
          {selectedDoctor ? (
            <>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateSelect}
                includeDates={availableDates}
                minDate={new Date()}
                inline
                calendarClassName="appointment-calendar"
              />
              {availableDates.length === 0 && (
                <div className="no-availability">
                  <p>No available dates for the next 30 days.</p>
                  <p>Please select another doctor or contact the clinic.</p>
                </div>
              )}
            </>
          ) : (
            <div className="select-doctor-prompt">
              <i className="fas fa-user-md"></i>
              <p>Please select a doctor first</p>
            </div>
          )}
        </div>
        
        <div className="form-section time-slot-section">
          <h3>{propDoctorId ? '2. Select Time' : '3. Select Time'}</h3>
          {selectedDate ? (
            loading ? (
              <div className="loading">Loading available times...</div>
            ) : timeSlots.length === 0 ? (
              <div className="no-slots">
                <i className="fas fa-calendar-times"></i>
                <p>No available time slots for the selected date.</p>
                <p>Please select another date.</p>
              </div>
            ) : (
              <div className="time-slots">
                {timeSlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`time-slot ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot.formattedTime}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="select-date-prompt">
              <i className="fas fa-calendar-alt"></i>
              <p>Please select a date first</p>
            </div>
          )}
        </div>
        
        <div className="form-section appointment-details-section">
          <h3>{propDoctorId ? '3. Appointment Details' : '4. Appointment Details'}</h3>
          
          <div className="form-group">
            <label htmlFor="type">Appointment Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="in-person">In-Person</option>
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>
          
          {formData.type === 'in-person' && (
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required={formData.type === 'in-person'}
                className="form-control"
              >
                <option value="">Select Location</option>
                <option value="Kigali Main Clinic">Kigali Main Clinic</option>
                <option value="Ubumuntu Health Center">Ubumuntu Health Center</option>
                <option value="Remera Branch">Remera Branch</option>
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="priorityLevel">Priority Level</label>
            <select
              id="priorityLevel"
              name="priorityLevel"
              value={formData.priorityLevel}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="low">Low - Regular check-up</option>
              <option value="normal">Normal - Minor concerns</option>
              <option value="high">High - Significant concerns</option>
              <option value="urgent">Urgent - Needs immediate attention</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="reason">Reason for Visit</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              placeholder="Briefly describe the reason for your appointment"
              className="form-control"
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="symptoms">Symptoms (optional)</label>
            <div className="symptoms-input-container">
              <input
                type="text"
                id="symptoms"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="Enter symptom and press Add"
                className="form-control"
              />
              <button 
                type="button" 
                onClick={handleAddSymptom} 
                className="btn btn-outline-secondary"
              >
                Add
              </button>
            </div>
            {formData.symptoms.length > 0 && (
              <div className="symptoms-tags">
                {formData.symptoms.map((symptom, index) => (
                  <div key={index} className="symptom-tag">
                    {symptom}
                    <button 
                      type="button" 
                      className="remove-symptom" 
                      onClick={() => handleRemoveSymptom(symptom)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="healthSummary">Brief Health Summary (optional)</label>
            <textarea
              id="healthSummary"
              name="healthSummary"
              value={formData.healthSummary}
              onChange={handleInputChange}
              placeholder="Provide a brief summary of your health history relevant to this appointment"
              className="form-control"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !selectedDoctor || !selectedSlot}
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedAppointmentBooking;
