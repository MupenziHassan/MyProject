import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
// Import login and register from the correct path
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// Import only the components you're actually using
import ConnectionErrorHandler from './components/common/ConnectionErrorHandler';
import LoadingState from './components/common/LoadingState';
import apiConnection from './utils/apiConnection';

// Create a simple Logout component inline
const Logout = () => {
  useEffect(() => {
    // Implement logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page after a small delay
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center py-5">
      <h3>Logging you out...</h3>
      <p>Please wait while we log you out of the system.</p>
    </div>
  );
};

// Create a NotFound component for the 404 route
const NotFound = () => (
  <div className="container mt-5 text-center">
    <h1>404 - Page Not Found</h1>
    <p className="lead">The page you are looking for does not exist.</p>
    <a href="/" className="btn btn-primary">Go back to home page</a>
  </div>
);

// Create simple placeholder dashboard components instead of lazy loading
// non-existent components
const PatientDashboard = () => (
  <div className="patient-dashboard">
    <h1>Patient Dashboard</h1>
    <p>Welcome to your patient dashboard. Your health information is displayed here.</p>
  </div>
);

const DoctorDashboard = () => (
  <div className="doctor-dashboard">
    <h1>Doctor Dashboard</h1>
    <p>Welcome to your doctor dashboard. Your patients and appointments are displayed here.</p>
  </div>
);

const AdminDashboard = () => (
  <div className="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <p>Welcome to the admin dashboard. System management options are displayed here.</p>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children, role }) => {
  // Implementation of protected route logic
  // This is just a placeholder - you should implement actual authentication logic
  const isAuthenticated = true;
  const userRole = 'admin';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (role && role !== userRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  // Initialize API connection on app start but don't block UI rendering
  useEffect(() => {
    const initApp = async () => {
      try {
        // Try to connect but don't block rendering
        await apiConnection.checkHealth();
        // Even if connection fails, continue with app initialization
      } catch (error) {
        console.warn('Backend connection issue:', error.message);
        // Don't set init error to avoid blocking the UI
      } finally {
        // Always complete initialization to show the UI
        setIsInitializing(false);
      }
    };

    // Short timeout to allow UI to render first
    setTimeout(() => {
      initApp();
    }, 100);
  }, []);

  // Handle retry of initialization
  const handleRetryInit = () => {
    setIsInitializing(true);
    
    // Re-run initialization
    apiConnection.initConnection()
      .then(() => {
        setIsInitializing(false);
      })
      .catch(error => {
        console.warn('Retry initialization:', error.message);
        setIsInitializing(false);
      });
  };

  // Use original routes but wrap in LoadingState with shorter initialization
  return (
    <LoadingState 
      isLoading={isInitializing && false} // Set to false to prevent blocking UI
      error={initError}
      loadingMessage="Initializing application..."
      onRetry={handleRetryInit}
    >
      <Router>
        <AuthProvider>
          {/* Use original routes structure */}
          <Routes>
            {/* Public Routes with the correct components */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/logout" element={<Logout />} />
            
            {/* Dashboard Routes */}
            <Route path="/patient/*" element={<PatientDashboard />} />
            <Route path="/doctor/*" element={<DoctorDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Only show ConnectionErrorHandler when needed, not on login page */}
          <ConnectionErrorHandlerWrapper />
        </AuthProvider>
      </Router>
    </LoadingState>
  );
}

// Wrapper to control when ConnectionErrorHandler appears
const ConnectionErrorHandlerWrapper = () => {
  const [showError, setShowError] = useState(false);
  const location = window.location.pathname;
  
  useEffect(() => {
    // Only show server error on non-login pages
    const isLoginPage = location === '/login' || location === '/register' || location === '/';
    const timer = setTimeout(() => {
      setShowError(!isLoginPage);
    }, 2000);
    return () => clearTimeout(timer);
  }, [location]);
  
  if (!showError) return null;
  
  return <ConnectionErrorHandler />;
};

export default App;
