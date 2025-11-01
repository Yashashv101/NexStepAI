const UserProgress = require('../models/UserProgress');
const Activity = require('../models/Activity');
const Roadmap = require('../models/Roadmap');

// @desc    Get user progress for a specific roadmap
// @route   GET /api/progress/:roadmapId
// @access  Private
exports.getUserProgress = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    
    let progress = await UserProgress.findOne({ userId, roadmapId })
      .populate('roadmapId', 'title description steps')
      .populate('goalId', 'name category');
    
    if (!progress) {
      // Create initial progress record if it doesn't exist
      const roadmap = await Roadmap.findById(roadmapId);
      if (!roadmap) {
        return res.status(404).json({
          success: false,
          message: 'Roadmap not found'
        });
      }
      
      progress = await UserProgress.create({
        userId,
        roadmapId,
        goalId: roadmap.goalId,
        stepProgress: roadmap.steps.map(step => ({
          stepId: step._id,
          completed: false,
          timeSpent: 0,
          notes: ''
        }))
      });
      
      progress = await UserProgress.findById(progress._id)
        .populate('roadmapId', 'title description steps')
        .populate('goalId', 'name category');
    }
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update step completion
// @route   PUT /api/progress/:roadmapId/step/:stepId
// @access  Private
exports.updateStepProgress = async (req, res) => {
  try {
    const { roadmapId, stepId } = req.params;
    const { completed, timeSpent, notes } = req.body;
    const userId = req.user.id;
    
    let progress = await UserProgress.findOne({ userId, roadmapId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }
    
    // Find and update the specific step
    const stepIndex = progress.stepProgress.findIndex(
      step => step.stepId.toString() === stepId
    );
    
    if (stepIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Step not found in progress'
      });
    }
    
    const stepProgress = progress.stepProgress[stepIndex];
    const wasCompleted = stepProgress.completed;
    
    // Update step progress
    if (completed !== undefined) stepProgress.completed = completed;
    if (timeSpent !== undefined) stepProgress.timeSpent += timeSpent;
    if (notes !== undefined) stepProgress.notes = notes;
    
    if (completed && !wasCompleted) {
      stepProgress.completedAt = new Date();
    } else if (!completed && wasCompleted) {
      stepProgress.completedAt = null;
    }
    
    await progress.save();
    
    // Log activity for step completion
    if (completed && !wasCompleted) {
      const roadmap = await Roadmap.findById(roadmapId);
      const step = roadmap.steps.id(stepId);
      
      await Activity.createActivity({
        userId,
        type: 'step_completed',
        title: `Completed step: ${step.title}`,
        description: `Finished step in ${roadmap.title}`,
        metadata: {
          roadmapId,
          stepId,
          timeSpent: stepProgress.timeSpent
        },
        icon: 'check-circle',
        color: 'green'
      });
    }
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error updating step progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all user progress
// @route   GET /api/progress
// @access  Private
exports.getAllUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const progress = await UserProgress.find(query)
      .populate('roadmapId', 'title description difficulty estimatedDuration')
      .populate('goalId', 'name category')
      .sort({ lastActivityAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await UserProgress.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: progress.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: progress
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/progress/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await UserProgress.aggregate([
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
    
    const result = stats[0] || {
      totalRoadmaps: 0,
      completedRoadmaps: 0,
      inProgressRoadmaps: 0,
      totalTimeSpent: 0,
      averageProgress: 0
    };
    
    // Get recent activities
    const recentActivities = await Activity.getUserActivities(userId, 1, 5);
    
    res.status(200).json({
      success: true,
      data: {
        ...result,
        recentActivities: recentActivities.data
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

// @desc    Start a roadmap
// @route   POST /api/progress/:roadmapId/start
// @access  Private
exports.startRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    
    // Check if progress already exists
    const existingProgress = await UserProgress.findOne({ userId, roadmapId });
    
    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap already started'
      });
    }
    
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }
    
    const progress = await UserProgress.create({
      userId,
      roadmapId,
      goalId: roadmap.goalId,
      stepProgress: roadmap.steps.map(step => ({
        stepId: step._id,
        completed: false,
        timeSpent: 0,
        notes: ''
      })),
      startedAt: new Date()
    });
    
    // Log activity
    await Activity.createActivity({
      userId,
      type: 'roadmap_started',
      title: `Started roadmap: ${roadmap.title}`,
      description: `Began learning journey`,
      metadata: {
        roadmapId,
        goalId: roadmap.goalId
      },
      icon: 'play-circle',
      color: 'blue'
    });
    
    res.status(201).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error starting roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Reset roadmap progress
// @route   PUT /api/progress/:roadmapId/reset
// @access  Private
exports.resetProgress = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    
    const progress = await UserProgress.findOne({ userId, roadmapId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }
    
    // Reset all step progress
    progress.stepProgress.forEach(step => {
      step.completed = false;
      step.timeSpent = 0;
      step.completedAt = null;
      step.notes = '';
    });
    
    progress.overallProgress = 0;
    progress.totalTimeSpent = 0;
    progress.status = 'not_started';
    progress.startedAt = null;
    progress.completedAt = null;
    
    await progress.save();
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};