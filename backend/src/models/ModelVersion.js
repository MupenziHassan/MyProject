const mongoose = require('mongoose');

const ModelVersionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  version: {
    type: String,
    required: [true, 'Please add a version number'],
    trim: true
  },
  predictionType: {
    type: String,
    enum: [
      'cancer_risk', 
      'diabetes_risk', 
      'heart_disease_risk', 
      'stroke_risk', 
      'mental_health',
      'custom'
    ],
    required: true
  },
  // For custom prediction types
  customType: String,
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  status: {
    type: String,
    enum: ['development', 'testing', 'active', 'deprecated', 'archived'],
    default: 'development'
  },
  // Performance metrics
  metrics: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    auc: Number,
    specificity: Number,
    sensitivityAt95Specificity: Number,
    other: mongoose.Schema.Types.Mixed
  },
  // Technical details
  technical: {
    algorithm: String, // E.g., "Random Forest", "Neural Network", etc.
    framework: String, // E.g., "scikit-learn", "TensorFlow", etc.
    featureCount: Number,
    trainingDataSize: Number,
    validationMethod: String,
    trainingDate: Date,
    deploymentDate: Date
  },
  // Features used by the model
  features: [{
    name: String,
    description: String,
    importance: Number, // Feature importance score
    type: {
      type: String,
      enum: ['numerical', 'categorical', 'binary', 'text', 'timestamp', 'other']
    },
    required: Boolean,
    defaultValue: mongoose.Schema.Types.Mixed
  }],
  // API integration details
  api: {
    endpoint: String,
    method: {
      type: String,
      enum: ['GET', 'POST'],
      default: 'POST'
    },
    contentType: {
      type: String,
      default: 'application/json'
    },
    requestTemplate: String, // Template for structuring request
    responseMapping: mongoose.Schema.Types.Mixed // How to map API response to our schema
  },
  // Usage statistics
  usage: {
    totalPredictions: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    averageResponseTime: Number // in milliseconds
  },
  // Validation and verification
  validation: {
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validationDate: Date,
    approvedForClinical: {
      type: Boolean,
      default: false
    },
    clinicalLimitations: [String],
    validationDocuments: [{
      title: String,
      fileUrl: String,
      uploadedAt: Date
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to update updatedAt field
ModelVersionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Increment total predictions when used
ModelVersionSchema.methods.incrementUsage = async function() {
  this.usage.totalPredictions += 1;
  this.usage.lastUsed = new Date();
  await this.save();
};

// Add response time to calculate average
ModelVersionSchema.methods.addResponseTime = async function(responseTime) {
  if (!this.usage.averageResponseTime) {
    this.usage.averageResponseTime = responseTime;
  } else {
    // Simple moving average
    this.usage.averageResponseTime = 
      (this.usage.averageResponseTime * (this.usage.totalPredictions - 1) + responseTime) / 
      this.usage.totalPredictions;
  }
  await this.save();
};

// Virtual to get the full identifier
ModelVersionSchema.virtual('identifier').get(function() {
  return `${this.name}-${this.version}`;
});

// Virtual to check if this is the latest version
ModelVersionSchema.virtual('predictions', {
  ref: 'Prediction',
  localField: '_id',
  foreignField: 'model.id',
  count: true
});

// Indexes
ModelVersionSchema.index({ name: 1, version: 1 }, { unique: true });
ModelVersionSchema.index({ status: 1 });
ModelVersionSchema.index({ predictionType: 1, status: 1 });

module.exports = mongoose.model('ModelVersion', ModelVersionSchema);
