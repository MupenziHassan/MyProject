import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState({ isOnline: true, message: '' });
  
  const navigate = useNavigate();
  const { auth, login } = useContext(AuthContext);
  
  useEffect(() => {
    // Check if server is running on component mount
    const checkServer = async () => {
      setServerStatus({
        isOnline: false,
        message: 'Checking server connection...'
      });
      
      try {
        const result = await api.checkServer();
        
        setServerStatus({
          isOnline: result.success,
          message: result.success 
            ? '' // Don't show technical message to users
            : 'Server connection issue. Please try again later.'
        });
      } catch (err) {
        setServerStatus({
          isOnline: false,
          message: 'Server connection issue. Please try again later.'
        });
      }
    };
    
    checkServer();
    
    // Check if user is already logged in
    if (auth && auth.isAuthenticated) {
      navigate(`/${auth.role}/dashboard`);
    }
  }, [auth, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        navigate(`/${result.role}/dashboard`, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
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
