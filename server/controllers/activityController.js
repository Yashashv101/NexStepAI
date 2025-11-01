const Activity = require('../models/Activity');

// @desc    Get user activities
// @route   GET /api/activities
// @access  Private
exports.getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      type, 
      isPublic,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = { userId };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }
    
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Activity.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: activities
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get public activities (feed)
// @route   GET /api/activities/public
// @access  Public
exports.getPublicActivities = async (req, res) => {
  try {
    const { 
      type, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = { isPublic: true };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const activities = await Activity.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Activity.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: activities
    });
  } catch (error) {
    console.error('Error fetching public activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create activity
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      metadata,
      icon,
      color,
      isPublic
    } = req.body;
    
    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type and title'
      });
    }
    
    const activity = await Activity.create({
      userId: req.user.id,
      type,
      title,
      description,
      metadata: metadata || {},
      icon: icon || 'activity',
      color: color || 'blue',
      isPublic: isPublic || false
    });
    
    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update activity visibility
// @route   PUT /api/activities/:id/visibility
// @access  Private
exports.updateActivityVisibility = async (req, res) => {
  try {
    const { isPublic } = req.body;
    
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Check if user owns the activity
    if (activity.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this activity'
      });
    }
    
    activity.isPublic = isPublic;
    await activity.save();
    
    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error updating activity visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Check if user owns the activity or is admin
    if (activity.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this activity'
      });
    }
    
    await Activity.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get activity types
// @route   GET /api/activities/types
// @access  Public
exports.getActivityTypes = async (req, res) => {
  try {
    const types = await Activity.distinct('type');
    
    res.status(200).json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error fetching activity types:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user activity summary
// @route   GET /api/activities/summary
// @access  Private
exports.getActivitySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const summary = await Activity.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const totalActivities = await Activity.countDocuments({
      userId,
      createdAt: { $gte: startDate }
    });
    
    res.status(200).json({
      success: true,
      data: {
        summary,
        totalActivities,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};