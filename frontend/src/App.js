import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { getCurrentUser } from './services/authService';

// Layout Components
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import HealthDashboard from './pages/HealthDashboard';
import SubmitHealthData from './pages/SubmitHealthData';
import PatientAppointments from './pages/PatientAppointments';
import AppointmentSchedule from './pages/AppointmentSchedule';
import AppointmentDetails from './pages/AppointmentDetails';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getCurrentUser();
  
  if (!user || !user.token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.user.role)) {
    return <Navigate to={`/${user.user.role}/dashboard`} />;
  }
  
  return children;
};

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    role: null
  });
  
  useEffect(() => {
    const user = getCurrentUser();
    
    if (user && user.token) {
      setAuth({
        isAuthenticated: true,
        user: user.user,
        role: user.user.role
      });
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Patient Routes */}
          <Route path="/patient/*" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="health-dashboard" element={<HealthDashboard />} />
            <Route path="health-data/submit" element={<SubmitHealthData />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="appointments/schedule" element={<AppointmentSchedule />} />
            <Route path="appointments/schedule/:doctorId" element={<AppointmentSchedule />} />
            <Route path="appointments/:appointmentId" element={<AppointmentDetails />} />
          </Route>
          
          {/* Doctor Routes */}
          <Route path="/doctor/*" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DoctorDashboard />} />
            {/* Add more doctor routes as needed */}
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* Add more admin routes as needed */}
          </Route>
          
          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
