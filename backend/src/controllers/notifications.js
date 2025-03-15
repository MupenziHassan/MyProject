const Notification = require('../models/Notification');
const NotificationTemplate = require('../models/NotificationTemplate');
const notificationService = require('../services/NotificationService');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getUserNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, page, limit } = req.query;
    
    const options = {
      unreadOnly: unreadOnly === 'true',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };
    
    const result = await notificationService.getUserNotifications(
      req.user.id,
      options
    );
    
    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, 'status.read': false },
      { 
        'status.read': true,
        'status.readAt': new Date()
      }
    );
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// Admin-only controllers for notification templates

// @desc    Get all notification templates
// @route   GET /api/v1/notifications/templates
// @access  Private (Admin)
exports.getNotificationTemplates = async (req, res, next) => {
  try {
    const templates = await NotificationTemplate.find();
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a notification template
// @route   POST /api/v1/notifications/templates
// @access  Private (Admin)
exports.createNotificationTemplate = async (req, res, next) => {
  try {
    const template = await NotificationTemplate.create(req.body);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a notification template
// @route   PUT /api/v1/notifications/templates/:id
// @access  Private (Admin)
exports.updateNotificationTemplate = async (req, res, next) => {
  try {
    const template = await NotificationTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
};
