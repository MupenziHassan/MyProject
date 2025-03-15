import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AvailabilityManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availabilityData, setAvailabilityData] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    date: new Date(),
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    slotDuration: 30,
    isRecurring: false,
    recurringPattern: null
  });
  
  // Fetch doctor's availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const res = await axios.get('/api/v1/appointments/doctor/availability', {
          params: {
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString()
          }
        });
        
        setAvailabilityData(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load availability data');
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [selectedDate]);
  
  // Check if a date has availability set
  const hasAvailability = (date) => {
    const dateStr = date.toDateString();
    return availabilityData.some(avail => 
      new Date(avail.date).toDateString() === dateStr
    );
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
      // Reset recurring pattern if isRecurring is unchecked
      recurringPattern: checked ? formData.recurringPattern : null
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      
      await axios.post('/api/v1/appointments/availability', {
        ...formData,
        date: selectedDate.toISOString()
      });
      
      setSuccess('Availability has been set successfully');
      
      // Refresh availability data
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const res = await axios.get('/api/v1/appointments/doctor/availability', {
        params: {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        }
      });
      
      setAvailabilityData(res.data.data);
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set availability');
      setLoading(false);
    }
  };
  
  return (
    <div className="availability-management">
      <h2>Manage Your Availability</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="availability-calendar-container">
        <h3>Your Availability Calendar</h3>
        <DatePicker
          selected={selectedDate}
          onChange={setSelectedDate}
          inline
          calendarClassName="availability-calendar"
          dayClassName={date => hasAvailability(date) ? 'has-availability' : undefined}
        />
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color has-availability"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color"></div>
            <span>No Availability Set</span>
          </div>
        </div>
      </div>
      
      <div className="availability-form-container">
        <h3>Set Availability for {selectedDate.toDateString()}</h3>
        
        <form onSubmit={handleSubmit} className="availability-form">
          <div className="form-group">
            <label>Working Hours</label>
            <div className="time-range">
              <input
                type="time"
                name="workingHours.start"
                value={formData.workingHours.start}
                onChange={handleInputChange}
                required
                className="form-control"
              />
              <span className="time-separator">to</span>
              <input
                type="time"
                name="workingHours.end"
                value={formData.workingHours.end}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="slotDuration">Appointment Duration (minutes)</label>
            <select
              id="slotDuration"
              name="slotDuration"
              value={formData.slotDuration}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          
          <div className="form-check">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleCheckboxChange}
              className="form-check-input"
            />
            <label htmlFor="isRecurring" className="form-check-label">
              Repeat this schedule
            </label>
          </div>
          
          {formData.isRecurring && (
            <div className="form-group">
              <label htmlFor="recurringPattern">Repeat Every</label>
              <select
                id="recurringPattern"
                name="recurringPattern"
                value={formData.recurringPattern || ''}
                onChange={handleInputChange}
                required={formData.isRecurring}
                className="form-control"
              >
                <option value="">Select a pattern</option>
                <option value="weekly">Week</option>
                <option value="biweekly">2 Weeks</option>
                <option value="monthly">4 Weeks</option>
              </select>
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Set Availability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvailabilityManagement;
