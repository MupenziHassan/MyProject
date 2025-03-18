const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  
  // Default error response
  const error = {
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.error = messages.join(', ');
    res.status(400).json(error);
    return;
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.error = 'Email address already in use';
    res.status(400).json(error);
    return;
  }
  
  // Send the error response
  res.status(err.statusCode || 500).json(error);
};

module.exports = errorHandler;
