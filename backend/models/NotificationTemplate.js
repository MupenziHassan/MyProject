const mongoose = require('mongoose');

const NotificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  type: {
    type: String,
    enum: ['test_result', 'appointment', 'prediction', 'medication', 'system', 'other'],
    required: true
  },
  channels: {
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      subject: String,
      template: String
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      template: String
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      },
      title: String,
      template: String
    },
    push: {
      enabled: {
        type: Boolean,
        default: false
      },
      title: String,
      template: String
    }
  },
  variables: [{
    name: String,
    description: String,
    required: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update timestamps
NotificationTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('NotificationTemplate', NotificationTemplateSchema);
