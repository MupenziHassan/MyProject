import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleBasedRoute from './components/routing/RoleBasedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css';

const App = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={
            currentUser ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/register" element={
            currentUser ? <Navigate to="/dashboard" /> : <Register />
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/patient/*" element={
            <RoleBasedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </RoleBasedRoute>
          } />
          
          <Route path="/doctor/*" element={
            <RoleBasedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/*" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
