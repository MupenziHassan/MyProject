import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../utils/apiConfig';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.request(() => 
        apiService.auth.forgotPassword({ email })
      );
      
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || 'Failed to process request. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>
        
        {success ? (
          <div className="auth-success">
            <div className="success-icon">✓</div>
            <h3>Check your email</h3>
            <p>
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions.
            </p>
            <Link to="/login" className="btn btn-primary btn-block">
              Return to Login
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
            
            <div className="auth-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
      
      <div className="auth-footer">
        <p>
          For emergency assistance, please contact Ubumuntu Clinic directly at <a href="tel:+250782123456">+250 782 123 456</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
