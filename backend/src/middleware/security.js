const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');  // New XSS package
const hpp = require('hpp');

// Middleware to enhance API security
exports.securityMiddleware = [
  // Set security HTTP headers
  helmet(),
  
  // Rate limiting to prevent brute force attacks
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min window
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, error: 'Too many requests, please try again later' }
  }),
  
  // Data sanitization against NoSQL query injection
  mongoSanitize(),
  
  // Data sanitization against XSS - updated implementation
  (req, res, next) => {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xss(req.body[key]);
        }
      });
    }
    
    // Sanitize request query and params similarly
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = xss(req.query[key]);
        }
      });
    }
    
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = xss(req.params[key]);
        }
      });
    }
    
    next();
  },
  
  // Prevent HTTP parameter pollution
  hpp()
];

// Additional security for sensitive routes
exports.sensitiveRouteProtection = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: { success: false, error: 'Too many attempts, please try again later' }
});
