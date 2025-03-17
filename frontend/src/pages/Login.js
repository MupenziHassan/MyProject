import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import apiService from '../utils/apiConfig';
import '../styles/Auth.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState({ running: true, message: '' });

  // Check server connection on component mount
  useEffect(() => {
    const setupConnection = async () => {
      try {
        // Use the apiService utility to check the health of the server
        const healthStatus = await apiService.checkHealth();
        
        setServerStatus({ 
          running: healthStatus.running, 
          message: healthStatus.message 
        });
        
        if (healthStatus.running) {
          // Set auth token if available
          const token = localStorage.getItem('token');
          if (token) {
            apiService.setAuthToken(token);
          }
        }
      } catch (err) {
        console.error('Server connection error:', err);
        setServerStatus({
          running: false,
          message: `Cannot connect to the backend server at ${apiService.defaults.baseURL}. Please check if the server is running.`
        });
      }
    };
    
    setupConnection();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (!serverStatus.running) {
      setError('Server is not running. Please check your connection.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(credentials);
      
      if (result.success) {
        // Navigate to the appropriate dashboard
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role) {
          navigate(`/${user.role}/dashboard`);
        } else {
          navigate('/patient/dashboard'); // Default fallback
        }
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {!serverStatus.running && (
            <div className="server-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{serverStatus.message}</p>
            </div>
          )}
          
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading || !serverStatus.running}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading || !serverStatus.running}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading || !serverStatus.running}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="auth-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/register">Create Account</Link>
          </div>
        </form>
      </div>
      
      <div className="auth-footer">
        <p>
          Having trouble? Contact Ubumuntu Clinic at <a href="tel:+250782123456">+250 782 123 456</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
