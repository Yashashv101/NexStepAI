const User = require('../models/User');
const Activity = require('../models/Activity');
const UserProgress = require('../models/UserProgress');
const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    let query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Filter by status (we'll add this field to User model if needed)
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const users = await User.find(query)
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private
exports.getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user progress statistics
    const progressStats = await UserProgress.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalRoadmaps: { $sum: 1 },
          completedRoadmaps: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressRoadmaps: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          totalTimeSpent: { $sum: '$totalTimeSpent' },
          averageProgress: { $avg: '$overallProgress' }
        }
      }
    ]);

    const stats = progressStats[0] || {
      totalRoadmaps: 0,
      completedRoadmaps: 0,
      inProgressRoadmaps: 0,
      totalTimeSpent: 0,
      averageProgress: 0
    };

    // Get recent activities (last 5)
    const recentActivities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type title description createdAt icon color');

    // Get current week's learning time
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyProgress = await UserProgress.aggregate([
      { $match: { userId: userId, lastActivityAt: { $gte: weekStart } } },
      {
        $group: {
          _id: null,
          weeklyTimeSpent: { $sum: '$totalTimeSpent' },
          stepsCompleted: {
            $sum: {
              $size: {
                $filter: {
                  input: '$stepProgress',
                  cond: { 
                    $and: [
                      { $eq: ['$$this.completed', true] },
                      { $gte: ['$$this.completedAt', weekStart] }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]);

    const weeklyStats = weeklyProgress[0] || {
      weeklyTimeSpent: 0,
      stepsCompleted: 0
    };

    // Get learning streak
    const learningStreak = await calculateLearningStreak(userId);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        ...weeklyStats,
        learningStreak,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, unreadOnly = false } = req.query;

    // For now, we'll generate notifications based on user progress and activities
    // In a real app, you'd have a separate Notification model
    const notifications = [];

    // Check for incomplete roadmaps that haven't been updated in a while
    const staleRoadmaps = await UserProgress.find({
      userId,
      status: 'in_progress',
      lastActivityAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days ago
    }).populate('roadmapId', 'title');

    staleRoadmaps.forEach(progress => {
      notifications.push({
        id: `stale_${progress._id}`,
        type: 'reminder',
        title: 'Continue Your Learning',
        message: `You haven't made progress on "${progress.roadmapId.title}" in a while. Keep going!`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        read: false,
        icon: 'clock',
        color: 'yellow'
      });
    });

    // Check for completed milestones
    const recentCompletions = await Activity.find({
      userId,
      type: 'step_completed',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).limit(3);

    recentCompletions.forEach(activity => {
      notifications.push({
        id: `completion_${activity._id}`,
        type: 'achievement',
        title: 'Great Progress!',
        message: activity.title,
        createdAt: activity.createdAt,
        read: false,
        icon: 'check-circle',
        color: 'green'
      });
    });

    // Sort by creation date
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedNotifications = notifications.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      count: paginatedNotifications.length,
      total: notifications.length,
      page: parseInt(page),
      pages: Math.ceil(notifications.length / limit),
      data: paginatedNotifications
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Helper function to calculate learning streak
const calculateLearningStreak = async (userId) => {
  try {
    const activities = await Activity.find({
      userId,
      type: { $in: ['step_completed', 'roadmap_started'] }
    }).sort({ createdAt: -1 });

    if (activities.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if user has activity today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasActivityToday = activities.some(activity => {
      const activityDate = new Date(activity.createdAt);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });

    if (!hasActivityToday) {
      // If no activity today, start checking from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Count consecutive days with activity
    for (let i = 0; i < 365; i++) { // Max 365 days
      const hasActivity = activities.some(activity => {
        const activityDate = new Date(activity.createdAt);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === currentDate.getTime();
      });

      if (hasActivity) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating learning streak:', error);
    return 0;
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id && role && role !== user.role) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    
    await user.save();
    
    // Log activity
    await Activity.createActivity({
      userId: req.user.id,
      type: 'user_updated',
      title: `Updated user: ${user.name}`,
      description: `User profile updated by admin`,
      metadata: {
        targetUserId: user._id,
        updatedFields: Object.keys(req.body)
      },
      icon: 'user-edit',
      color: 'blue'
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    // Log activity
    await Activity.createActivity({
      userId: req.user.id,
      type: 'user_deleted',
      title: `Deleted user: ${user.name}`,
      description: `User account deleted by admin`,
      metadata: {
        deletedUserId: user._id,
        deletedUserEmail: user.email
      },
      icon: 'user-minus',
      color: 'red'
    });
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          adminUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          regularUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalUsers: 0,
      adminUsers: 0,
      regularUsers: 0
    };
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...result,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};