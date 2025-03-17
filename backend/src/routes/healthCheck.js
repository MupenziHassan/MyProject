const express = require('express');
const router = express.Router();
const os = require('os');

/**
 * @desc    Check API health status
 * @route   GET /api/health-check
 * @access  Public
 */
router.get('/', (req, res) => {
  // Calculate uptime in a more human-readable format
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  
  let uptime = '';
  if (days > 0) uptime += `${days}d `;
  if (hours > 0 || days > 0) uptime += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) uptime += `${minutes}m `;
  uptime += `${seconds}s`;
  
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    port: req.socket.localPort,
    environment: process.env.NODE_ENV || 'development',
    dbConnected: global.dbConnected || false,
    status: {
      uptime,
      uptimeSeconds,
      memory: {
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`
      }
    }
  });
});

// Export the router
module.exports = router;
