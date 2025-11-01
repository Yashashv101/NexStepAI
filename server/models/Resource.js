const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a resource title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify resource type'],
    enum: ['article', 'video', 'course', 'book', 'tutorial', 'documentation', 'practice'],
    default: 'article'
  },
  url: {
    type: String,
    required: [true, 'Please add a resource URL'],
    match: [
      /^https?:\/\/.+/,
      'Please add a valid URL'
    ]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: String,
    required: [true, 'Please add estimated completion time']
  },
  tags: [{
    type: String,
    trim: true
  }],
  skillsRequired: [{
    type: String,
    trim: true
  }],
  skillsLearned: [{
    type: String,
    trim: true
  }],
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
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
});

// Create indexes for efficient queries
ResourceSchema.index({ type: 1, difficulty: 1 });
ResourceSchema.index({ goalId: 1 });
ResourceSchema.index({ isActive: 1 });
ResourceSchema.index({ createdAt: -1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ 'rating.average': -1, 'rating.count': -1 });

// Update the updatedAt field before saving
ResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resource', ResourceSchema);