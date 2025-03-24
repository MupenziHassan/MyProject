import React from 'react';
import PropTypes from 'prop-types';

const Skeleton = ({ type, count = 1, className = '' }) => {
  // Generate skeleton based on type
  const generateSkeleton = (type, index) => {
    switch (type) {
      case 'text':
        return (
          <div key={index} className={`skeleton-text ${className}`}>
            <div className="skeleton-line" style={{ width: '100%' }}></div>
          </div>
        );
        
      case 'card':
        return (
          <div key={index} className={`skeleton-card ${className}`}>
            <div className="skeleton-card-header">
              <div className="skeleton-circle"></div>
              <div className="skeleton-lines">
                <div className="skeleton-line" style={{ width: '60%' }}></div>
                <div className="skeleton-line" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="skeleton-card-body">
              <div className="skeleton-line" style={{ width: '90%' }}></div>
              <div className="skeleton-line" style={{ width: '80%' }}></div>
              <div className="skeleton-line" style={{ width: '85%' }}></div>
            </div>
          </div>
        );
        
      case 'table-row':
        return (
          <div key={index} className={`skeleton-table-row ${className}`}>
            <div className="skeleton-cell" style={{ width: '20%' }}></div>
            <div className="skeleton-cell" style={{ width: '30%' }}></div>
            <div className="skeleton-cell" style={{ width: '15%' }}></div>
            <div className="skeleton-cell" style={{ width: '20%' }}></div>
            <div className="skeleton-cell" style={{ width: '15%' }}></div>
          </div>
        );
        
      case 'circle':
        return (
          <div key={index} className={`skeleton-circle ${className}`}></div>
        );
        
      case 'avatar':
        return (
          <div key={index} className={`skeleton-avatar ${className}`}>
            <div className="skeleton-circle"></div>
            <div className="skeleton-lines">
              <div className="skeleton-line" style={{ width: '70%' }}></div>
              <div className="skeleton-line" style={{ width: '50%' }}></div>
            </div>
          </div>
        );
        
      case 'form':
        return (
          <div key={index} className={`skeleton-form ${className}`}>
            <div className="skeleton-form-group">
              <div className="skeleton-label"></div>
              <div className="skeleton-input"></div>
            </div>
            <div className="skeleton-form-group">
              <div className="skeleton-label"></div>
              <div className="skeleton-input"></div>
            </div>
            <div className="skeleton-form-group">
              <div className="skeleton-label"></div>
              <div className="skeleton-textarea"></div>
            </div>
            <div className="skeleton-button"></div>
          </div>
        );
        
      default:
        return (
          <div key={index} className={`skeleton-rectangle ${className}`}></div>
        );
    }
  };
  
  // Generate multiple skeletons if count > 1
  const skeletons = Array(count)
    .fill(null)
    .map((_, i) => generateSkeleton(type, i));
  
  return (
    <>
      {skeletons}
      
      <style jsx="true">{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.6;
          }
        }
        
        .skeleton-line, .skeleton-circle, .skeleton-rectangle, 
        .skeleton-cell, .skeleton-input, .skeleton-label, 
        .skeleton-textarea, .skeleton-button {
          background-color: #e5e7eb;
          animation: pulse 1.5s ease-in-out 0.5s infinite;
          border-radius: 4px;
        }
        
        .skeleton-text {
          margin-bottom: 8px;
          width: 100%;
        }
        
        .skeleton-line {
          height: 16px;
          margin-bottom: 8px;
          border-radius: 4px;
        }
        
        .skeleton-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        
        .skeleton-card {
          width: 100%;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .skeleton-card-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .skeleton-lines {
          flex-grow: 1;
          margin-left: 12px;
        }
        
        .skeleton-card-body .skeleton-line:last-child {
          margin-bottom: 0;
        }
        
        .skeleton-table-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .skeleton-cell {
          height: 24px;
          margin-right: 12px;
        }
        
        .skeleton-avatar {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .skeleton-form-group {
          margin-bottom: 16px;
        }
        
        .skeleton-label {
          height: 16px;
          width: 30%;
          margin-bottom: 8px;
        }
        
        .skeleton-input {
          height: 40px;
          width: 100%;
        }
        
        .skeleton-textarea {
          height: 100px;
          width: 100%;
        }
        
        .skeleton-button {
          height: 40px;
          width: 120px;
          margin-top: 16px;
        }
      `}</style>
    </>
  );
};

Skeleton.propTypes = {
  type: PropTypes.oneOf(['text', 'card', 'table-row', 'circle', 'avatar', 'form', 'rectangle']).isRequired,
  count: PropTypes.number,
  className: PropTypes.string
};

export default Skeleton;
