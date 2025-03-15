import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Add missing imports for appointment components
import AppointmentsList from '../components/patient/AppointmentsList';
import AppointmentBooking from '../components/patient/AppointmentBooking';
// ...other imports...

const PatientRoutes = () => {
  return (
    <Routes>
      {/* ...existing routes... */}
      <Route path="appointments" element={<AppointmentsList />} />
      <Route path="appointments/book" element={<AppointmentBooking />} />
      <Route path="appointments/book/:doctorId" element={<AppointmentBooking />} />
      {/* ...existing routes... */}
    </Routes>
  );
};

export default PatientRoutes;
