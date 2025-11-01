const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  stepProgress: [{
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters']
    }
  }],
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'paused'],
    default: 'not_started'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
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

// Create compound index for efficient queries
UserProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, status: 1 });
UserProgressSchema.index({ goalId: 1 });

// Update the updatedAt and lastActivityAt fields before saving
UserProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastActivityAt = Date.now();
  
  // Calculate overall progress based on completed steps
  if (this.stepProgress && this.stepProgress.length > 0) {
    const completedSteps = this.stepProgress.filter(step => step.completed).length;
    this.overallProgress = Math.round((completedSteps / this.stepProgress.length) * 100);
    
    // Calculate total time spent
    this.totalTimeSpent = this.stepProgress.reduce((total, step) => total + (step.timeSpent || 0), 0);
    
    // Update status based on progress
    if (this.overallProgress === 100) {
      this.status = 'completed';
      if (!this.completedAt) {
        this.completedAt = Date.now();
      }
    } else if (this.overallProgress > 0) {
      this.status = 'in_progress';
      if (!this.startedAt) {
        this.startedAt = Date.now();
      }
    }
  }
  
  next();
});

module.exports = mongoose.model('UserProgress', UserProgressSchema);