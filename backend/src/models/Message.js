const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  conversationId: {
    type: String
  },
  type: {
    type: String,
    enum: ['patient_question', 'clinical_update', 'appointment_related', 'test_related', 'administrative', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'archived', 'deleted'],
    default: 'sent'
  },
  readAt: Date,
  // If related to a specific entity
  relatedTo: {
    model: {
      type: String,
      enum: ['Appointment', 'Test', 'MedicalRecord', 'Prediction', null]
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  // For secure messages (e.g., containing PHI)
  securityLevel: {
    type: String,
    enum: ['standard', 'sensitive', 'confidential'],
    default: 'standard'
  },
  // Attachments
  attachments: [{
    filename: String,
    originalFilename: String,
    mimeType: String,
    size: Number, // in bytes
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to update updatedAt field
MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If this is a new message (not a reply), generate a conversation ID
  if (!this.conversationId && !this.parentMessage) {
    this.conversationId = this._id.toString();
  }
  
  next();
});

// When message is marked as read, update readAt timestamp
MessageSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Middleware to handle replies: If this is a reply, inherit the conversationId
MessageSchema.pre('save', async function(next) {
  if (this.parentMessage && !this.conversationId) {
    try {
      const parentMessage = await this.constructor.findById(this.parentMessage);
      if (parentMessage) {
        this.conversationId = parentMessage.conversationId;
      }
    } catch (err) {
      console.error('Error finding parent message:', err);
    }
  }
  next();
});

// Virtual for checking if message contains attachments
MessageSchema.virtual('hasAttachments').get(function() {
  return this.attachments && this.attachments.length > 0;
});

// Virtual to generate a preview of the message content
MessageSchema.virtual('preview').get(function() {
  const maxLength = 100;
  if (!this.content) return '';
  
  return this.content.length > maxLength 
    ? this.content.substring(0, maxLength) + '...' 
    : this.content;
});

// Define indexes for common queries
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, status: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });

module.exports = mongoose.model('Message', MessageSchema);
