import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AuthProvider } from './contexts/AuthContext';

// Private route component
function RequireAuth({ children, allowedRoles }) {
  // We'll implement auth check logic inside this component
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
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
    
    return children;
  } catch (e) {
    console.error('Error parsing user data', e);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}

function App() {
  useEffect(() => {
    // Configure the API service with the token from local storage
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setAuthToken(token); // Using proper method from apiService
    }
  }, []);

  return (
    <Router>
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
                element={
                  <RequireAuth allowedRoles={['patient']}>
                    <PatientDashboard />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/doctor/dashboard" 
                element={
                  <RequireAuth allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </RequireAuth>
                }
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <RequireAuth allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RequireAuth>
                }
              />
              <Route 
                path="/patient/health-education" 
                element={
                  <RequireAuth allowedRoles={['patient']}>
                    <PatientHealthEducation />
                  </RequireAuth>
                }
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
    </Router>
  );
}

export default App;
