import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import apiService from '../utils/apiConfig';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState({ checking: true, connected: false });
  const navigate = useNavigate();
  const { setCurrentUser, login } = useContext(AuthContext);

  // Configure API and check server status when component mounts
  useEffect(() => {
    const setupConnection = async () => {
      setServerStatus({ checking: true, connected: false });
      const connected = await apiService.configureApi();
      setServerStatus({ checking: false, connected });
    };
    
    setupConnection();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Don't attempt login if server is disconnected
    if (!serverStatus.connected) {
      setError('Cannot connect to server. Please ensure the backend is running.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email: formData.email });
      
      const result = await login(formData);
      
      if (result.success) {
        // Configure API with the new token
        const token = localStorage.getItem('token');
        if (token) {
          apiService.setAuthToken(token);
        }
        
        navigate('/dashboard');
      } else {
        console.error('Login error:', result.error);
        
        if (!navigator.onLine) {
          setError('You appear to be offline. Please check your internet connection.');
        } else if (result.error.response?.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (result.error.response?.data?.error) {
          setError(result.error.response.data.error);
        } else {
          setError('Login failed. Please check your credentials and ensure the server is running.');
        }
        
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (!navigator.onLine) {
        setError('You appear to be offline. Please check your internet connection.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please check your credentials and ensure the server is running.');
      }
      
      setLoading(false);
    }
  };

  // Function to retry server connection
  const retryConnection = async () => {
    setServerStatus({ checking: true, connected: false });
    const connected = await apiService.configureApi();
    setServerStatus({ checking: false, connected });
  };

  return (
    <div className="login-page">
      <div className="form-container">
        <h2>Login to Your Account</h2>
        
        {!serverStatus.checking && !serverStatus.connected && (
          <div className="alert alert-warning">
            <strong>Server Connection Issue:</strong> Cannot connect to the backend server.
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={retryConnection}
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !serverStatus.connected}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="form-footer">
          <p>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
