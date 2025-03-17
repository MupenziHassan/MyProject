const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health-check
 * @desc    Check if the API server is running
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
