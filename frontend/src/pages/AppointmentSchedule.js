import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import EnhancedAppointmentBooking from '../components/patient/EnhancedAppointmentBooking';
import '../styles/AppointmentBooking.css';

const AppointmentSchedule = () => {
  const location = useLocation();
  const { doctorId } = useParams();
  const [predictionId, setPredictionId] = useState(null);
  const [testId, setTestId] = useState(null);
  
  useEffect(() => {
    // Get query parameters if any
    const queryParams = new URLSearchParams(location.search);
    const predId = queryParams.get('predictionId');
    const tId = queryParams.get('testId');
    
    if (predId) setPredictionId(predId);
    if (tId) setTestId(tId);
  }, [location]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Schedule an Appointment</h1>
        <p>
          Choose the doctor, date, and time that works best for you. Our healthcare
          providers are ready to assist you with your health concerns.
        </p>
      </div>
      
      <div className="page-content">
        <EnhancedAppointmentBooking 
          doctorId={doctorId} 
          predictionId={predictionId} 
          testId={testId}
        />
      </div>
    </div>
  );
};

export default AppointmentSchedule;
