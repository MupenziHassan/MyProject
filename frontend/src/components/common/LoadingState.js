import React from 'react';
import PropTypes from 'prop-types';

const LoadingState = ({ 
  isLoading, 
  error, 
  children, 
  loadingMessage = 'Loading...', 
  loadingComponent,
  errorComponent,
  onRetry
}) => {
  // If not loading and no error, render children
  if (!isLoading && !error) {
    return children;
  }
  
  // If custom loading component provided, use it
  if (isLoading && loadingComponent) {
    return loadingComponent;
  }
  
  // If custom error component provided and there's an error, use it
  if (error && errorComponent) {
    return errorComponent;
  }
  
  return (
    <div className="loading-state-container">
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p className="loading-text">{loadingMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle error-icon"></i>
          <h4>Error Loading Data</h4>
          <p>{typeof error === 'string' ? error : 'An unexpected error occurred. Please try again.'}</p>
          {onRetry && (
            <button className="retry-button" onClick={onRetry}>
              <i className="fas fa-redo-alt"></i> Retry
            </button>
          )}
        </div>
      )}
      
      <style jsx="true">{`
        .loading-state-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          width: 100%;
        }
        
        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-text {
          margin-top: 16px;
          font-size: 16px;
          color: #4b5563;
        }
        
        .error-message {
          text-align: center;
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 16px;
          max-width: 80%;
        }
        
        .error-icon {
          font-size: 32px;
          color: #ef4444;
          margin-bottom: 8px;
        }
        
        .error-message h4 {
          margin: 0 0 8px;
          color: #b91c1c;
        }
        
        .error-message p {
          margin: 0 0 16px;
          color: #7f1d1d;
        }
        
        .retry-button {
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .retry-button:hover {
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

LoadingState.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.bool]),
  loadingMessage: PropTypes.string,
  loadingComponent: PropTypes.element,
  errorComponent: PropTypes.element,
  onRetry: PropTypes.func,
  children: PropTypes.node.isRequired
};

export default LoadingState;
