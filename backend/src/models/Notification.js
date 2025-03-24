const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'appointment_reminder', 
      'appointment_confirmation', 
      'appointment_cancelled',
      'test_ordered', 
      'test_results', 
      'prediction_results',
      'message', 
      'system', 
      'verification',
      'account',
      'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  // Link to the relevant entity
  relatedTo: {
    model: {
      type: String,
      enum: ['Appointment', 'Test', 'MedicalRecord', 'Prediction', 'Message', 'User']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  // Deep link or action
  action: {
    type: {
      type: String,
      enum: ['link', 'button', 'form', 'none'],
      default: 'link'
    },
    url: String,
    buttonText: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  },
  // When notification should appear
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  // For timed/recurring notifications
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom']
    },
    interval: Number, // Interval between notifications
    ends: {
      type: Date
    },
    lastSent: Date
  },
  // For notifications sent through external channels
  channels: {
    inApp: {
      sent: {
        type: Boolean,
        default: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    },
    email: {
      sent: Boolean,
      sentAt: Date,
      emailId: String,
      address: String
    },
    sms: {
      sent: Boolean,
      sentAt: Date,
      messageId: String,
      phoneNumber: String
    },
    push: {
      sent: Boolean,
      sentAt: Date,
      deviceTokens: [String]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: Date,
  expiresAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// When notification is marked as read, update readAt
NotificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Virtual for isExpired
NotificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
});

// Virtual for age of notification in minutes
NotificationSchema.virtual('ageInMinutes').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.floor(diffTime / (1000 * 60));
});

// Indexes for efficient queries
NotificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });
NotificationSchema.index({ scheduledFor: 1 });
NotificationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
