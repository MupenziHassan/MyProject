const mongoose = require('mongoose');

const NotificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['test_result', 'appointment', 'prediction', 'system', 'message'],
    required: true
  },
  channels: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      subject: {
        type: String,
        trim: true
      },
      template: {
        type: String,
        required: function() {
          return this.channels.email.enabled;
        }
      }
    },
    sms: {
      enabled: {
        type: Boolean,
        default: true
      },
      template: {
        type: String,
        required: function() {
          return this.channels.sms.enabled;
        }
      }
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      },
      title: {
        type: String,
        trim: true
      },
      template: {
        type: String,
        required: function() {
          return this.channels.inApp.enabled;
        }
      }
    }
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NotificationTemplate', NotificationTemplateSchema);
