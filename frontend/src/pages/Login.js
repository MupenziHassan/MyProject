import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import apiService from '../utils/apiConfig';
import '../styles/Auth.css';
import ServerConnectionTest from '../components/common/ServerConnectionTest';

const Login = () => {
  const auth = useContext(AuthContext);
  const login = auth?.login; // Safely access login function
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState({ running: true, message: '' });
  const [contextError, setContextError] = useState(false);
  
  // Check if AuthContext is available
  useEffect(() => {
    if (!auth) {
      setContextError(true);
      setError('Authentication service is not available. Please make sure the application is properly configured.');
      console.error('AuthContext is undefined. Make sure Login is wrapped in AuthProvider.');
    }
  }, [auth]);

  // Check server connection on component mount but don't block UI
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const healthStatus = await apiService.checkHealth();
        
        setServerStatus({ 
          running: healthStatus.running, 
          message: healthStatus.message 
        });
        
        if (healthStatus.running) {
          const token = localStorage.getItem('token');
          if (token) {
            apiService.setAuthToken(token);
          }
        }
      } catch (err) {
        console.error('Server connection error:', err);
        setServerStatus({
          running: false,
          message: `Connection to the backend server might be unavailable. You can still try to log in.`
        });
      }
    };
    
    checkServerConnection();
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
    
    if (!login) {
      setError('Authentication service is not available');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Before actual login, try to ensure server connection
      const serverCheck = await apiService.checkHealth();
      console.log('Server check before login:', serverCheck);
      
      // Proceed with login attempt regardless of server check result
      console.log('Attempting login with:', credentials.email);
      const result = await login(credentials);
      console.log('Login result:', result);
      
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
      console.error('Login error:', err);
      setError(`Login error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Show registration success message if coming from registration
  useEffect(() => {
    if (auth?.registrationSuccess) {
      setError('');
      setServerStatus({
        ...serverStatus,
        successMessage: 'Registration successful! Please log in with your new account.'
      });
      
      // Clear the success flag after showing the message
      if (auth.setRegistrationSuccess) {
        auth.setRegistrationSuccess(false);
      }
    }
  }, [auth?.registrationSuccess]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {contextError && (
            <div className="auth-error">
              <p>Authentication service not available. Please refresh the page or contact support.</p>
            </div>
          )}
          
          {serverStatus.successMessage && (
            <div className="auth-success">
              <i className="fas fa-check-circle"></i>
              <p>{serverStatus.successMessage}</p>
            </div>
          )}
          
          {!serverStatus.running && (
            <div className="server-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <p>
                {serverStatus.message}
                <br />
                <small>You can still attempt to log in - we'll try to connect to the server.</small>
              </p>
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
              disabled={loading || contextError}
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
              disabled={loading || contextError}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading || contextError || !login}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="auth-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/register">Create Account</Link>
          </div>
        </form>
      </div>
      
      {error && error.includes('No response from server') && (
        <ServerConnectionTest 
          onConnectionSuccess={(port) => {
            // Update server status
            setServerStatus({
              running: true,
              message: `Connected to server on port ${port}`
            });
            // Clear any existing error
            setError('');
          }}
        />
      )}
      
      <div className="auth-footer">
        <p>
          Having trouble? Contact Ubumuntu Clinic at <a href="tel:+250782123456">+250 782 123 456</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
