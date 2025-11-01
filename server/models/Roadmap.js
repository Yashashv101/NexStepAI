const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a roadmap title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    required: [true, 'Please specify difficulty level'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: {
    type: String,
    required: [true, 'Please add estimated duration'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  steps: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    resources: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }],
    skills: [{
      type: String,
      trim: true
    }],
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    order: {
      type: Number,
      required: true
    }
  }],
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
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'paused'],
    default: 'not_started'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  usersCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
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
RoadmapSchema.index({ goalId: 1 });
RoadmapSchema.index({ userId: 1 });
RoadmapSchema.index({ category: 1, difficulty: 1 });
RoadmapSchema.index({ isPublic: 1, isTemplate: 1 });
RoadmapSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
RoadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate progress based on completed steps
  if (this.steps && this.steps.length > 0) {
    const completedSteps = this.steps.filter(step => step.completed).length;
    this.progress = Math.round((completedSteps / this.steps.length) * 100);
    
    // Update status based on progress
    if (this.progress === 100) {
      this.status = 'completed';
    } else if (this.progress > 0) {
      this.status = 'in_progress';
    }
  }
  
  next();
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);