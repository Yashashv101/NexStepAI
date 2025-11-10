const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Please specify activity type'],
    enum: [
      'goal_created',
      'goal_completed',
      'roadmap_started',
      'roadmap_completed',
      'step_completed',
      'resource_accessed',
      'profile_updated',
      'login',
      'registration',
      'user_deleted'
    ]
  },
  title: {
    type: String,
    required: [true, 'Please add activity title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  metadata: {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap'
    },
    stepId: {
      type: mongoose.Schema.Types.ObjectId
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    timeSpent: {
      type: Number // in minutes
    },
    progress: {
      type: Number // percentage
    }
  },
  icon: {
    type: String,
    default: 'activity'
  },
  color: {
    type: String,
    enum: ['blue', 'green', 'purple', 'orange', 'red', 'gray'],
    default: 'blue'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, type: 1 });
ActivitySchema.index({ createdAt: -1 });

// Static method to create activity
ActivitySchema.statics.createActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

// Static method to get user activities with pagination
ActivitySchema.statics.getUserActivities = async function(userId, limit = 10, skip = 0) {
  try {
    const activities = await this.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('metadata.goalId', 'name')
      .populate('metadata.roadmapId', 'title')
      .populate('metadata.resourceId', 'title');
    
    return activities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

module.exports = mongoose.model('Activity', ActivitySchema);