const express = require('express');
const {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate
} = require('../controllers/notifications');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// User notification routes
router.get('/', getUserNotifications);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllNotificationsRead);

// Admin-only template routes
router.get('/templates', authorize('admin'), getNotificationTemplates);
router.post('/templates', authorize('admin'), createNotificationTemplate);
router.put('/templates/:id', authorize('admin'), updateNotificationTemplate);

module.exports = router;
