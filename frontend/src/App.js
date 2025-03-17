import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import apiService from './utils/apiConfig';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientHealthEducation from './pages/PatientHealthEducation';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Private route component
const PrivateRoute = ({ element, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    switch (currentUser.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'patient':
        return <Navigate to="/patient/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return element;
};

function App() {
  useEffect(() => {
    // Configure the API with the token from local storage
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setAuthToken(token);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Private routes */}
              <Route 
                path="/patient/dashboard" 
                element={<PrivateRoute element={<PatientDashboard />} allowedRoles={['patient']} />} 
              />
              <Route 
                path="/doctor/dashboard" 
                element={<PrivateRoute element={<DoctorDashboard />} allowedRoles={['doctor']} />} 
              />
              <Route 
                path="/admin/dashboard" 
                element={<PrivateRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/patient/health-education" 
                element={<PrivateRoute element={<PatientHealthEducation />} allowedRoles={['patient']} />}
              />
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
