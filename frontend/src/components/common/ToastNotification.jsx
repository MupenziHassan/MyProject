import React, { useState } from 'react';
import { Toast } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ToastNotification = ({ 
  show, 
  variant = 'success', 
  title, 
  message, 
  onClose, 
  autohide = true,
  delay = 5000,
  position = 'top-right'
}) => {
  const [localShow, setLocalShow] = useState(show);
  
  // Handle toast close
  const handleClose = () => {
    setLocalShow(false);
    if (onClose) onClose();
  };
  
  // Position classes
  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'position-fixed top-0 start-0 m-3';
      case 'top-center':
        return 'position-fixed top-0 start-50 translate-middle-x m-3';
      case 'top-right':
        return 'position-fixed top-0 end-0 m-3';
      case 'bottom-left':
        return 'position-fixed bottom-0 start-0 m-3';
      case 'bottom-center':
        return 'position-fixed bottom-0 start-50 translate-middle-x m-3';
      case 'bottom-right':
        return 'position-fixed bottom-0 end-0 m-3';
      default:
        return 'position-fixed top-0 end-0 m-3';
    }
  };
  
  // Toast background class based on variant
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-success text-white';
      case 'danger':
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning';
      case 'info':
        return 'bg-info';
      default:
        return 'bg-light';
    }
  };
  
  return (
    <div className={getPositionClass()}>
      <Toast 
        show={localShow} 
        onClose={handleClose} 
        delay={delay} 
        autohide={autohide}
        className={getVariantClass()}
      >
        <Toast.Header closeButton>
          <strong className="me-auto">{title || 'Notification'}</strong>
        </Toast.Header>
        <Toast.Body>
          {message}
        </Toast.Body>
      </Toast>
    </div>
  );
};

ToastNotification.propTypes = {
  show: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info', 'error']),
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onClose: PropTypes.func,
  autohide: PropTypes.bool,
  delay: PropTypes.number,
  position: PropTypes.oneOf([
    'top-left', 'top-center', 'top-right', 
    'bottom-left', 'bottom-center', 'bottom-right'
  ])
};

export default ToastNotification;
