import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Add missing imports for appointment components
import AppointmentCalendar from '../components/doctor/AppointmentCalendar';
import AvailabilityManagement from '../components/doctor/AvailabilityManagement';
// ...other imports...

const DoctorRoutes = () => {
  return (
    <Routes>
      {/* ...existing routes... */}
      <Route path="appointments" element={<AppointmentCalendar />} />
      <Route path="availability" element={<AvailabilityManagement />} />
      {/* ...existing routes... */}
    </Routes>
  );
};

export default DoctorRoutes;
