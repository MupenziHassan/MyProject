import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout components
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import Profile from './pages/patient/Profile';
import CancerRiskAssessment from './pages/patient/health-assessment';
import HealthRecords from './pages/patient/HealthRecords';
import AssessmentDetail from './pages/patient/AssessmentDetail';
import AssessmentHistory from './pages/patient/AssessmentHistory';
import Appointments from './pages/patient/Appointments';
import AppointmentDetails from './pages/patient/AppointmentDetails';
import MedicalRecords from './pages/patient/MedicalRecords';
import MedicalRecordDetail from './pages/patient/MedicalRecordDetail';
import NotificationsPage from './pages/patient/NotificationsPage';
import AppointmentSchedule from './pages/patient/AppointmentSchedule';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import PatientsList from './pages/doctor/PatientsList';
import PatientDetails from './pages/doctor/PatientDetails';
import PatientAssessment from './pages/doctor/PatientAssessment';
import PatientSelection from './pages/doctor/PatientSelection';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import RiskAssessments from './pages/doctor/RiskAssessments';
import TreatmentPlan from './pages/doctor/TreatmentPlan';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings';
import Analytics from './pages/admin/Analytics';

// Common components
import AuthDebug from './components/common/AuthDebug';
import Logout from './components/common/Logout';

function App() {
  return (
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
          <Route path="profile" element={<Profile />} />
          <Route path="health-assessment" element={<CancerRiskAssessment />} />
          <Route path="assessments" element={<AssessmentHistory />} />
          <Route path="assessments/:assessmentId" element={<AssessmentDetail />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/schedule" element={<AppointmentSchedule />} />
          <Route path="appointments/:appointmentId" element={<AppointmentDetails />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="medical-records/:recordId" element={<MedicalRecordDetail />} />
          <Route path="health-records" element={<HealthRecords />} />
          <Route path="notifications" element={<NotificationsPage />} />
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
          <Route path="patients/:patientId/treatment-plan" element={<TreatmentPlan />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="patients/:patientId/new-assessment" element={<PatientAssessment />} />
          <Route path="new-assessment" element={<PatientSelection />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Add AuthDebug in development mode */}
      {process.env.NODE_ENV === 'development' && <AuthDebug />}
    </Router>
  );
}

export default App;
