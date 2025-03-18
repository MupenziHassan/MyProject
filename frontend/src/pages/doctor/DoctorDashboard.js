import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const DoctorDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Verify we have auth data
    if (!auth || !auth.isAuthenticated) {
      setError('Please log in to view your dashboard');
      setLoading(false);
      return;
    }
    
    // Set user data from auth context
    setUserData(auth.user);
    setLoading(false);
    
  }, [auth]);
  
  if (loading) {
    return <div>Loading doctor dashboard...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="doctor-dashboard">
      <h1>Welcome, Dr. {userData?.name || 'Doctor'}!</h1>
      
      <div className="dashboard-content">
        <p>Your doctor dashboard is ready.</p>
        {/* Display relevant doctor information without technical details */}
      </div>
    </div>
  );
};

export default DoctorDashboard;
