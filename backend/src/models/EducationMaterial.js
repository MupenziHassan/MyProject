const mongoose = require('mongoose');

const EducationMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  type: {
    type: String,
    enum: ['article', 'video', 'infographic', 'pdf', 'external_link', 'interactive', 'other'],
    required: true
  },
  topics: [{
    type: String,
    enum: [
      'cancer', 'heart_disease', 'diabetes', 'nutrition', 'exercise',
      'mental_health', 'medication', 'vaccination', 'women_health',
      'men_health', 'pediatric', 'geriatric', 'preventive_care', 'other'
    ]
  }],
  // For specific conditions
  relatedConditions: [{
    name: String,
    icd10Code: String
  }],
  // Audience targeting
  targetAudience: {
    ageGroups: [{
      type: String,
      enum: ['children', 'teenagers', 'young_adults', 'adults', 'seniors']
    }],
    forPatients: {
      type: Boolean,
      default: true
    },
    forCaregivers: Boolean,
    forClinicians: Boolean,
    languages: [String],
    readingLevel: {
      type: String,
      enum: ['elementary', 'intermediate', 'advanced', 'professional']
    }
  },
  // Media information
  media: {
    primaryImageUrl: String,
    thumbnailUrl: String,
    duration: String, // For videos
    fileSize: Number, // In bytes for downloadable content
    fileUrl: String,
    fileType: String
  },
  // Author information
  author: {
    name: String,
    credentials: String,
    organization: String
  },
  // Publication information
  publication: {
    publishedDate: {
      type: Date,
      default: Date.now
    },
    lastUpdated: Date,
    version: String,
    source: String,
    citation: String
  },
  // Rating and reviews
  feedback: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    ratingsCount: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Tags for searchability
  tags: [String],
  // Related materials
  relatedMaterials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationMaterial'
    },
    relationship: {
      type: String,
      enum: ['prerequisite', 'follow_up', 'supplementary', 'alternative', 'series']
    }
  }],
  // Usage tracking
  usage: {
    viewCount: {
      type: Number,
      default: 0
    },
    uniqueViewers: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  // Approval and review status
  status: {
    type: String,
    enum: ['draft', 'under_review', 'approved', 'published', 'archived', 'deprecated'],
    default: 'draft'
  },
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    comments: String,
    approved: Boolean
  },
  // For restricting access or categorizing by department
  accessibility: {
    isPublic: {
      type: Boolean,
      default: true
    },
    restrictedTo: [{
      type: String,
      enum: ['patients', 'doctors', 'nurses', 'administrators']
    }],
    departments: [String]
  },
  // For tracking who created and modified the material
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
EducationMaterialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a text index for searching
EducationMaterialSchema.index({ 
  title: 'text', 
  description: 'text', 
  content: 'text',
  tags: 'text'
});

// Other indexes for common queries
EducationMaterialSchema.index({ topics: 1 });
EducationMaterialSchema.index({ 'relatedConditions.icd10Code': 1 });
EducationMaterialSchema.index({ status: 1 });
EducationMaterialSchema.index({ 'publication.publishedDate': -1 });
EducationMaterialSchema.index({ 'feedback.averageRating': -1 });

// Virtual for readingTime estimation (approximate minutes to read text content)
EducationMaterialSchema.virtual('readingTime').get(function() {
  if (!this.content || this.type !== 'article') return null;
  
  // Average reading speed: 200-250 words per minute
  // Using 225 as a middle value
  const wordCount = this.content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 225);
  
  return minutes;
});

// Method to increment view count
EducationMaterialSchema.methods.incrementViews = async function(isUniqueViewer = false) {
  this.usage.viewCount += 1;
  if (isUniqueViewer) {
    this.usage.uniqueViewers += 1;
  }
  await this.save();
};

// Method to add a rating
EducationMaterialSchema.methods.addRating = async function(userId, rating, comment = null) {
  // Check if user already rated this material
  const existingRatingIndex = this.feedback.reviews.findIndex(
    review => review.user.toString() === userId.toString()
  );
  
  if (existingRatingIndex >= 0) {
    // Update existing rating
    this.feedback.reviews[existingRatingIndex].rating = rating;
    if (comment) {
      this.feedback.reviews[existingRatingIndex].comment = comment;
    }
    this.feedback.reviews[existingRatingIndex].date = new Date();
  } else {
    // Add new rating
    this.feedback.reviews.push({
      user: userId,
      rating,
      comment,
      date: new Date()
    });
    this.feedback.ratingsCount += 1;
  }
  
  // Calculate new average rating
  let totalRating = 0;
  this.feedback.reviews.forEach(review => {
    totalRating += review.rating;
  });
  
  this.feedback.averageRating = totalRating / this.feedback.ratingsCount;
  
  await this.save();
  return this.feedback;
};

module.exports = mongoose.model('EducationMaterial', EducationMaterialSchema);
