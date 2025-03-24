import React from 'react';
import { Navigate } from 'react-router-dom';
import lazyLoad from './utils/lazyLoader';

// Lazy load all page components
const Login = lazyLoad(() => import('./pages/Login'));
const Register = lazyLoad(() => import('./pages/Register'));
const Logout = lazyLoad(() => import('./pages/Logout'));

// Patient routes
const PatientDashboard = lazyLoad(() => import('./pages/patient/Dashboard'));
const PatientAppointments = lazyLoad(() => import('./pages/patient/Appointments'));
const PatientMedicalRecords = lazyLoad(() => import('./pages/patient/MedicalRecords'));
const PatientProfile = lazyLoad(() => import('./pages/patient/Profile'));
const PatientPredictions = lazyLoad(() => import('./pages/patient/Predictions'));

// Doctor routes
const DoctorDashboard = lazyLoad(() => import('./pages/doctor/Dashboard'));
const DoctorPatients = lazyLoad(() => import('./pages/doctor/Patients'));
const DoctorAppointments = lazyLoad(() => import('./pages/doctor/Appointments'));
const DoctorProfile = lazyLoad(() => import('./pages/doctor/Profile'));

// Admin routes
const AdminDashboard = lazyLoad(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazyLoad(() => import('./pages/admin/Users'));
const AdminSettings = lazyLoad(() => import('./pages/admin/Settings'));

// Define routes configuration
const routes = [
  // Public routes
  {
    path: '/login',
    element: <Login />,
    public: true
  },
  {
    path: '/register',
    element: <Register />,
    public: true
  },
  {
    path: '/logout',
    element: <Logout />,
    public: true
  },
  {
    path: '/',
    element: <Navigate to="/login" />,
    public: true
  },
  
  // Patient routes
  {
    path: '/patient',
    element: <PatientDashboard />,
    role: 'patient'
  },
  {
    path: '/patient/appointments',
    element: <PatientAppointments />,
    role: 'patient'
  },
  {
    path: '/patient/medical-records',
    element: <PatientMedicalRecords />,
    role: 'patient'
  },
  {
    path: '/patient/profile',
    element: <PatientProfile />,
    role: 'patient'
  },
  {
    path: '/patient/predictions',
    element: <PatientPredictions />,
    role: 'patient'
  },
  
  // Doctor routes
  {
    path: '/doctor',
    element: <DoctorDashboard />,
    role: 'doctor'
  },
  {
    path: '/doctor/patients',
    element: <DoctorPatients />,
    role: 'doctor'
  },
  {
    path: '/doctor/appointments',
    element: <DoctorAppointments />,
    role: 'doctor'
  },
  {
    path: '/doctor/profile',
    element: <DoctorProfile />,
    role: 'doctor'
  },
  
  // Admin routes
  {
    path: '/admin',
    element: <AdminDashboard />,
    role: 'admin'
  },
  {
    path: '/admin/users',
    element: <AdminUsers />,
    role: 'admin'
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
    role: 'admin'
  }
];

export default routes;
