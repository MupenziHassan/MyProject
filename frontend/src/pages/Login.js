import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    isOnline: true,
    message: ''
  });

  useEffect(() => {
    // Check server status on mount
    const checkServerStatus = async () => {
      try {
        await axios.get('/api/v1/status');
        setServerStatus({ isOnline: true, message: '' });
      } catch (err) {
        console.error('Server connection error:', err);
        setServerStatus({ 
          isOnline: false, 
          message: 'No response from server. Please check your connection.' 
        });
      }
    };
    
    checkServerStatus();
    
    // If user is already logged in, redirect to dashboard
    if (auth && auth.isAuthenticated) {
      navigate(`/${auth.role}/dashboard`);
    }
  }, [navigate, auth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Update auth context
        setAuth({
          isAuthenticated: true,
          user: userData.user,
          role: userData.user.role
        });
        
        // Store token
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Navigate to role-specific dashboard
        navigate(`/${userData.user.role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login to Your Account</h2>
        </div>
        
        {!serverStatus.isOnline && (
          <div className="server-offline-alert">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{serverStatus.message}</p>
            <p className="offline-subtext">You can still attempt to log in - we'll try to connect to the server.</p>
          </div>
        )}
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
                placeholder="Enter your password"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
          <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
