const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log user actions for audit purposes
 */
const auditLogger = (action) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send to capture response
    res.send = function(data) {
      try {
        // Create audit log after response
        const userId = req.user ? req.user.id : null;
        const userRole = req.user ? req.user.role : null;
        
        const logData = {
          user: userId,
          role: userRole,
          action,
          resourceType: req.originalUrl.split('/')[2] || 'unknown', // Extract resource type from URL
          resourceId: req.params.id || null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          requestMethod: req.method,
          statusCode: res.statusCode,
          successful: res.statusCode >= 200 && res.statusCode < 400
        };
        
        // Don't await to avoid blocking response
        AuditLog.create(logData)
          .catch(err => console.error('Audit logging error:', err));
      } catch (err) {
        console.error('Error in audit logger:', err);
      }
      
      // Call original send
      originalSend.call(this, data);
      return this;
    };
    
    next();
  };
};

module.exports = auditLogger;
