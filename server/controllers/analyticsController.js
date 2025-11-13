const User = require('../models/User');
const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const UserProgress = require('../models/UserProgress');
const Activity = require('../models/Activity');
const { cache, generateCacheKey } = require('../utils/cache');

// @desc    Get analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const cacheKey = generateCacheKey.analyticsDashboard(timeRange);

    // Try to get from cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // If not in cache, compute the data
    const data = await cache.getOrSet(cacheKey, async () => {
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default: // 30d
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get basic stats
      const [
        totalUsers,
        totalGoals,
        completedGoals,
        totalRoadmaps,
        activeRoadmaps,
        goalCompletionData,
        avgCompletionTime,
        successRate,
      ] = await Promise.all([
        // Total users
        User.countDocuments({ status: 'active' }),
        
        // Total goals
        Goal.countDocuments(),
        
        // Completed goals (based on user progress)
        UserProgress.countDocuments({ status: 'completed' }),
        
        // Total roadmaps
        Roadmap.countDocuments(),
        
        // Active roadmaps (roadmaps with recent progress)
        UserProgress.distinct('roadmapId', { 
          lastActivityAt: { $gte: startDate } 
        }).then(roadmapIds => roadmapIds.length),
        
        // Goal completion by category
        getGoalCompletionByCategory(),
        
        // Average completion time
        getAverageCompletionTime(),
        
        // Success rate
        getSuccessRate(),
      ]);

      // Calculate user growth based on total users
      const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const previousTotalUsers = await User.countDocuments({ 
        status: 'active',
        createdAt: { $lt: startDate } 
      });
      
      const userGrowthPercentage = previousTotalUsers > 0 
        ? ((totalUsers - previousTotalUsers) / previousTotalUsers * 100).toFixed(1)
        : 0;

      return {
        totalUsers,
        totalGoals,
        completedGoals,
        totalRoadmaps,
        activeRoadmaps,
        avgCompletionTime,
        userGrowth: parseFloat(userGrowthPercentage),
        goalCompletionData,
        successRate,
        timeRange
      };
    }, 5 * 60 * 1000); // Cache for 5 minutes

    res.status(200).json({
      success: true,
      data,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/analytics/admin-stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const cacheKey = generateCacheKey.adminStats();

    // Try to get from cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // If not in cache, compute the data
    const data = await cache.getOrSet(cacheKey, async () => {
      const [
        totalUsers,
        totalGoals,
        totalRoadmaps,
        recentActivities,
        activeRoadmaps
      ] = await Promise.all([
        User.countDocuments({ status: 'active' }),
        Goal.countDocuments(),
        Roadmap.countDocuments(),
        getRecentActivities(),
        // Active roadmaps across the platform based on user progress status
        UserProgress.distinct('roadmapId', {
          status: { $in: ['in_progress', 'not_started'] }
        }).then(ids => ids.length)
      ]);

      return {
        totalUsers,
        totalGoals,
        totalRoadmaps,
        recentActivities,
        activeRoadmaps
      };
    }, 3 * 60 * 1000); // Cache for 3 minutes

    res.status(200).json({
      success: true,
      data,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Helper function to get goal completion by category
async function getGoalCompletionByCategory() {
  const categories = await Goal.distinct('category');
  const completionData = [];
  
  for (const category of categories) {
    const totalGoals = await Goal.countDocuments({ category });
    const completedGoals = await UserProgress.aggregate([
      {
        $lookup: {
          from: 'goals',
          localField: 'goalId',
          foreignField: '_id',
          as: 'goal'
        }
      },
      {
        $match: {
          'goal.category': category,
          status: 'completed'
        }
      },
      {
        $count: 'completed'
      }
    ]);
    
    const completed = completedGoals.length > 0 ? completedGoals[0].completed : 0;
    
    completionData.push({
      category,
      completed,
      total: totalGoals
    });
  }
  
  return completionData;
}

// Helper function to get average completion time
async function getAverageCompletionTime() {
  const completedProgress = await UserProgress.find({
    status: 'completed',
    startedAt: { $exists: true },
    completedAt: { $exists: true }
  });
  
  if (completedProgress.length === 0) return 0;
  
  const totalDays = completedProgress.reduce((sum, progress) => {
    const days = Math.ceil((progress.completedAt - progress.startedAt) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / completedProgress.length);
}

// Helper function to get success rate
async function getSuccessRate() {
  const totalProgress = await UserProgress.countDocuments({
    status: { $in: ['in_progress', 'completed'] }
  });
  const completedProgress = await UserProgress.countDocuments({
    status: 'completed'
  });
  
  if (totalProgress === 0) return 0;
  return Math.round((completedProgress / totalProgress) * 100);
}



// Helper function to get recent activities
async function getRecentActivities() {
  const activities = await Activity.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('type title description createdAt userId');
  
  return activities.map(activity => ({
    type: activity.type,
    title: activity.title,
    description: activity.description || activity.userId?.email || 'Unknown user',
    createdAt: activity.createdAt,
    timeAgo: getTimeAgo(activity.createdAt)
  }));
}

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}