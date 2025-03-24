const compression = require('compression');

// Determine if response should be compressed
const shouldCompress = (req, res) => {
  // Don't compress if client doesn't accept it
  if (req.headers['x-no-compression']) {
    return false;
  }
  
  // Use compression filter
  return compression.filter(req, res);
};

// Configure compression
const responseCompression = compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Minimum size in bytes to compress
  filter: shouldCompress
});

module.exports = responseCompression;
