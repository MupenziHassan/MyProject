import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { forgotPassword, error, clearError } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setFormError('Please enter your email address');
      return;
    }

    clearError();
    const isSuccess = await forgotPassword(email);
    
    if (isSuccess) {
      setSuccess(true);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Reset Your Password</h2>
        
        {success ? (
          <div className="success-message">
            <p>Password reset instructions have been sent to your email.</p>
            <p>
              <Link to="/login">Return to login</Link>
            </p>
          </div>
        ) : (
          <>
            {(error || formError) && (
              <div className="error-message">
                {error || formError}
              </div>
            )}
            <p>Enter your email address and we'll send you instructions to reset your password.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send Reset Link
              </button>
            </form>
            <div className="auth-links">
              <p>
                <Link to="/login">Back to Login</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
