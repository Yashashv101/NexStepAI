const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a goal name'],
    trim: true,
    maxlength: [100, 'Goal name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'DevOps',
      'Cybersecurity',
      'UI/UX Design',
      'Cloud Computing',
      'Backend Development',
      'Frontend Development',
      'Full Stack Development',
      'Game Development',
      'Blockchain',
      'Other'
    ],
    default: 'Other'
  },
  difficulty: {
    type: String,
    required: [true, 'Please specify difficulty level'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: String,
    required: [true, 'Please add estimated completion time'],
    trim: true
  },
  icon: {
    type: String,
    default: '📚'
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
  isActive: {
    type: Boolean,
    default: true
  },
  usersCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // AI Enhancement tracking
  isUserSubmitted: {
    type: Boolean,
    default: false
  },
  isAIEnhanced: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    service: {
      type: String,
      enum: ['gemini', 'manual'],
      default: 'manual'
    },
    enhancedAt: {
      type: Date
    },
    originalText: {
      type: String
    }
  },
  // Admin moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  moderationNotes: {
    type: String
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
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
GoalSchema.index({ category: 1, difficulty: 1 });
GoalSchema.index({ isActive: 1 });
GoalSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
GoalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Goal', GoalSchema);