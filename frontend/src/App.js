import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

// Import layouts
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings'; // Import the SystemSettings component
import HealthAssessment from './pages/patient/HealthAssessment';
import Appointments from './pages/patient/Appointments';
import AppointmentDetails from './pages/patient/AppointmentDetails'; // Import the AppointmentDetails component
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import RiskAssessments from './pages/doctor/RiskAssessments';
import PatientsList from './pages/doctor/PatientsList';
import PatientDetails from './pages/doctor/PatientDetails';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Import debugging component
import AuthDebug from './components/common/AuthDebug';
import Logout from './components/common/Logout'; // Import the Logout component

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useContext(AuthContext);
  
  if (!auth || !auth.isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    console.log(`Role ${auth.role} not allowed, redirecting`);
    return <Navigate to={`/${auth.role}/dashboard`} />;
  }
  
  console.log('Auth check passed, rendering content');
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} /> {/* Add this new route */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Patient Routes */}
        <Route path="/patient/*" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="health-assessment" element={<HealthAssessment />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/:appointmentId" element={<AppointmentDetails />} />
          {/* Add other patient routes here */}
        </Route>
        
        {/* Doctor Routes */}
        <Route path="/doctor/*" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="appointments/:appointmentId" element={<AppointmentDetails />} />
          <Route path="assessments" element={<RiskAssessments />} />
          <Route path="patients" element={<PatientsList />} />
          <Route path="patients/:patientId" element={<PatientDetails />} />
          <Route path="profile" element={<DoctorProfile />} />
          {/* Add other doctor routes here */}
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<SystemSettings />} /> {/* Add this line */}
          {/* Add other admin routes here */}
        </Route>
        
        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Add AuthDebug in development mode */}
      {process.env.NODE_ENV === 'development' && <AuthDebug />}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
