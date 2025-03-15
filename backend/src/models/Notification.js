const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['test_result', 'appointment', 'prediction', 'system', 'message'],
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Test', 'Prediction', 'Appointment', 'User', null],
      default: null
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  status: {
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  deliveryStatus: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null }
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null }
    },
    inApp: {
      delivered: { type: Boolean, default: true },
      deliveredAt: { type: Date, default: Date.now }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster querying by user and read status
NotificationSchema.index({ user: 1, 'status.read': 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
