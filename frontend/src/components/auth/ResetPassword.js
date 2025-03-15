import React, { useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { resetToken } = useParams();
  const { resetPassword, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    clearError();
    const isSuccess = await resetPassword(resetToken, password);
    
    if (isSuccess) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2>Create New Password</h2>
        
        {success ? (
          <div className="success-message">
            <p>Your password has been reset successfully.</p>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <>
            {(error || formError) && (
              <div className="error-message">
                {error || formError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength="6"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength="6"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Reset Password
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

export default ResetPassword;
