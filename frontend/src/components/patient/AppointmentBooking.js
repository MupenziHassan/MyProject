import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AppointmentBooking = ({ doctorId: propDoctorId, predictionId, testId }) => {
  const { doctorId: paramDoctorId } = useParams();
  const finalDoctorId = propDoctorId || paramDoctorId;
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [formData, setFormData] = useState({
    doctorId: finalDoctorId,
    date: null,
    duration: 30,
    type: 'in-person',
    reason: '',
    location: '',
    meetingLink: ''
  });
  
  // Add related entity info if provided
  useEffect(() => {
    if (predictionId) {
      setFormData(prev => ({
        ...prev,
        reason: 'Follow-up on cancer risk prediction',
        relatedTo: {
          model: 'Prediction',
          id: predictionId
        }
      }));
    } else if (testId) {
      setFormData(prev => ({
        ...prev,
        reason: 'Discuss test results',
        relatedTo: {
          model: 'Test',
          id: testId
        }
      }));
    }
  }, [predictionId, testId]);

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        if (!finalDoctorId) {
          setError("No doctor specified");
          setLoading(false);
          return;
        }
        
        const res = await axios.get(`/api/v1/doctors/${finalDoctorId}`);
        setDoctor(res.data.data);
        
        // Fetch doctor's available time slots for the next 30 days
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        
        const availabilityRes = await axios.get(
          `/api/v1/appointments/availability/${finalDoctorId}`, {
            params: {
              startDate: today.toISOString(),
              endDate: thirtyDaysLater.toISOString()
            }
          }
        );
        
        // Extract unique dates
        const dates = [];
        const slots = availabilityRes.data.data || [];
        
        if (slots.length === 0) {
          setError("No available appointment slots for this doctor");
        }
        
        slots.forEach(slot => {
          if (!slot.date) return;
          
          const date = new Date(slot.date);
          date.setHours(0, 0, 0, 0);
          
          if (!dates.find(d => d.getTime() === date.getTime())) {
            dates.push(date);
          }
        });
        
        setAvailableDates(dates);
        setLoading(false);
      } catch (err) {
        setError('Failed to load doctor information: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    if (finalDoctorId) {
      fetchDoctor();
    } else {
      setLoading(false);
    }
  }, [finalDoctorId]);

  // Fetch time slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      const fetchTimeSlots = async () => {
        try {
          setLoading(true);
          
          const startDate = new Date(selectedDate);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(selectedDate);
          endDate.setHours(23, 59, 59, 999);
          
          const availabilityRes = await axios.get(
            `/api/v1/appointments/availability/${finalDoctorId}`, {
              params: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
              }
            }
          );
          
          // Format time slots for display
          const slots = (availabilityRes.data.data || []).map(slot => {
            const startTime = new Date(slot.start || slot.date);
            const endTime = new Date(slot.end || new Date(startTime.getTime() + 30*60000));
            
            return {
              id: `${startTime.getTime()}-${endTime.getTime()}`,
              startTime: startTime,
              endTime: endTime,
              formattedTime: `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            };
          });
          
          setTimeSlots(slots);
          setLoading(false);
        } catch (err) {
          setError('Failed to load available time slots: ' + (err.response?.data?.error || err.message));
          setLoading(false);
        }
      };
      
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate, finalDoctorId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setFormData({ ...formData, date: null });
  };
  
  // Handle time slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setFormData({ 
      ...formData, 
      date: slot.startTime,
      duration: Math.round((slot.endTime - slot.startTime) / (60 * 1000)) // duration in minutes
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.date) {
        setError("Please select an appointment time");
        return;
      }
      
      await axios.post('/api/v1/appointments', formData);
      navigate('/patient/appointments');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    }
  };

  if (loading && !doctor) return <div className="loading">Loading doctor information...</div>;

  return (
    <div className="appointment-booking">
      <div className="booking-header">
        <h2>Book an Appointment</h2>
        {doctor && (
          <div className="doctor-info">
            <div className="doctor-avatar">
              {doctor.user?.name ? doctor.user.name.charAt(0) : 'D'}
            </div>
            <div className="doctor-details">
              <h3>Dr. {doctor.user?.name || 'Unknown'}</h3>
              <p className="specialization">{doctor.specialization || 'Doctor'}</p>
            </div>
          </div>
        )}
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section date-picker-section">
          <h3>1. Select Date</h3>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateSelect}
            includeDates={availableDates}
            minDate={new Date()}
            inline
            calendarClassName="appointment-calendar"
          />
        </div>
        
        <div className="form-section time-slot-section">
          <h3>2. Select Time</h3>
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
          <h3>3. Appointment Details</h3>
          
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
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required={formData.type === 'in-person'}
                placeholder="Office address or clinic location"
                className="form-control"
              />
            </div>
          )}
          
          {formData.type === 'video' && (
            <div className="form-group">
              <label htmlFor="meetingLink">Meeting Link (Optional)</label>
              <input
                type="text"
                id="meetingLink"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleInputChange}
                placeholder="Add a video call link or leave empty for system to generate"
                className="form-control"
              />
            </div>
          )}
          
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
            disabled={!selectedSlot}
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentBooking;
