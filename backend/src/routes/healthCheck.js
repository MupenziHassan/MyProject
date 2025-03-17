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
    status: {
      uptime,
      uptimeSeconds,
      memory: {
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        used: `${Math.round((os.totalmem() - os.freemem()) / 1024 / 1024)} MB`,
        usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
      },
      cpu: os.cpus().length
    }
  });
});

/**
 * @desc    Check API health status (detailed)
 * @route   GET /api/health-check/detailed
 * @access  Private (Admin only)
 */
router.get('/detailed', (req, res) => {
  // This would typically be protected by auth middleware,
  // but we're keeping it simple for this example
  
  // Get database connection status
  const dbStatus = {
    connected: true, // In a real app, check actual DB connection
    latency: '25ms'  // In a real app, measure actual DB latency
  };

  // Return detailed health information
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    hostname: os.hostname(),
    port: req.socket.localPort,
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbStatus,
      cache: { connected: true },
      storage: { connected: true }
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed
      }
    }
  });
});

module.exports = router;
