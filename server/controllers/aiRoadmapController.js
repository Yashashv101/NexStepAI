const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const Activity = require('../models/Activity');
const { generateRoadmap, enhanceGoal } = require('../services/aiService');

// In-memory rate limiting store (in production, use Redis)
const userRequestCounts = new Map();

// Rate limiting helper
function checkRateLimit(userId, maxRequests = 10, windowMs = 3600000) {
  const now = Date.now();
  const userKey = userId.toString();
  
  if (!userRequestCounts.has(userKey)) {
    userRequestCounts.set(userKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  
  const userData = userRequestCounts.get(userKey);
  
  // Reset if window has expired
  if (now >= userData.resetAt) {
    userRequestCounts.set(userKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  
  // Check if limit exceeded
  if (userData.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetAt: userData.resetAt,
      retryAfter: Math.ceil((userData.resetAt - now) / 1000)
    };
  }
  
  // Increment count
  userData.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - userData.count, 
    resetAt: userData.resetAt 
  };
}

// @desc    Submit a user goal and get AI enhancement suggestions
// @route   POST /api/ai/enhance-goal
// @access  Private
exports.enhanceUserGoal = async (req, res) => {
  try {
    const { goalText } = req.body;

    if (!goalText || goalText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid goal description (at least 10 characters)'
      });
    }

    // Rate limiting
    const rateLimitCheck = checkRateLimit(req.user.id);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again in ${rateLimitCheck.retryAfter} seconds`,
        retryAfter: rateLimitCheck.retryAfter
      });
    }

    // Call AI to enhance the goal
    const result = await enhanceGoal(goalText);

    res.status(200).json({
      success: true,
      data: result.enhancedGoal,
      aiService: result.aiService,
      rateLimit: {
        remaining: rateLimitCheck.remaining,
        resetAt: rateLimitCheck.resetAt
      }
    });
  } catch (error) {
    console.error('Error enhancing goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance goal. Please try again.',
      error: error.message
    });
  }
};

// @desc    Create a user-submitted goal (with optional AI enhancement)
// @route   POST /api/ai/create-user-goal
// @access  Private
exports.createUserGoal = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      difficulty,
      estimatedTime,
      tags,
      skillsRequired,
      skillsLearned,
      originalGoalText,
      isAIEnhanced
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !difficulty || !estimatedTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate difficulty enum values
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty level. Must be one of: ${validDifficulties.join(', ')}`
      });
    }

    // Create the goal with user submission flag
    const goal = await Goal.create({
      name,
      description,
      category,
      difficulty,
      estimatedTime,
      tags: tags || [],
      skillsRequired: skillsRequired || [],
      skillsLearned: skillsLearned || [],
      createdBy: req.user.id,
      isUserSubmitted: true,
      isAIEnhanced: isAIEnhanced || false,
      aiMetadata: isAIEnhanced ? {
        service: req.body.aiService || 'manual',
        enhancedAt: new Date(),
        originalText: originalGoalText || name
      } : undefined,
      moderationStatus: 'approved' // Auto-approve for now, can change to 'pending'
    });

    // Create activity log
    await Activity.createActivity({
      userId: req.user.id,
      type: 'goal_created',
      title: `Created goal: ${name}`,
      description: `New user-submitted ${difficulty} level goal in ${category}`,
      metadata: {
        goalId: goal._id,
        isAIEnhanced
      },
      icon: 'target',
      color: 'green'
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error creating user goal:', error);
    
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

// @desc    Generate AI roadmap for a goal
// @route   POST /api/ai/generate-roadmap
// @access  Private
exports.generateAIRoadmap = async (req, res) => {
  try {
    const { goalId, userContext } = req.body;

    if (!goalId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a goal ID'
      });
    }

    // Rate limiting
    const rateLimitCheck = checkRateLimit(req.user.id, 10, 3600000); // 10 per hour
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. You can generate ${rateLimitCheck.remaining} more roadmaps. Please try again in ${rateLimitCheck.retryAfter} seconds`,
        retryAfter: rateLimitCheck.retryAfter
      });
    }

    // Fetch the goal
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Prepare goal data for AI
    const goalData = {
      name: goal.name,
      description: goal.description,
      category: goal.category,
      difficulty: goal.difficulty,
      estimatedTime: goal.estimatedTime,
      tags: goal.tags,
      skillsRequired: goal.skillsRequired,
      skillsLearned: goal.skillsLearned
    };

    // Generate roadmap using AI
    console.log(`Generating AI roadmap for goal: ${goal.name}`);
    const result = await generateRoadmap(goalData, userContext || {});

    res.status(200).json({
      success: true,
      data: {
        roadmap: result.roadmap,
        goalId: goal._id,
        goalName: goal.name
      },
      aiService: result.aiService,
      aiModel: result.aiModel,
      rateLimit: {
        remaining: rateLimitCheck.remaining,
        resetAt: rateLimitCheck.resetAt
      }
    });
  } catch (error) {
    console.error('Error generating AI roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate roadmap. Please try again.',
      error: error.message
    });
  }
};

// @desc    Save AI-generated roadmap
// @route   POST /api/ai/save-roadmap
// @access  Private
exports.saveAIRoadmap = async (req, res) => {
  try {
    const {
      goalId,
      roadmapData,
      aiService,
      aiModel
    } = req.body;

    // Validate required fields
    if (!goalId || !roadmapData) {
      return res.status(400).json({
        success: false,
        message: 'Please provide goal ID and roadmap data'
      });
    }

    // Verify goal exists
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Validate roadmapData contains a minimum set of steps
    if (!roadmapData.steps || !Array.isArray(roadmapData.steps) || roadmapData.steps.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap generation incomplete: please ensure at least 4 steps before saving.'
      });
    }

    // Check if user already has a roadmap for this goal
    const existingRoadmap = await Roadmap.findOne({
      userId: req.user.id,
      goalId: goalId
    });

    if (existingRoadmap) {
      return res.status(400).json({
        success: false,
        message: 'You already have a roadmap for this goal. Please complete or delete the existing one first.'
      });
    }

    // Create the roadmap with AI metadata
    const roadmap = await Roadmap.create({
      title: roadmapData.title,
      description: roadmapData.description,
      goalId,
      userId: req.user.id,
      difficulty: roadmapData.difficulty || goal.difficulty,
      estimatedDuration: roadmapData.estimatedDuration,
      category: goal.category,
      steps: roadmapData.steps.map((step, index) => ({
        ...step,
        order: step.order || index + 1,
        completed: false
      })),
      tags: roadmapData.tags || goal.tags || [],
      skillsRequired: roadmapData.skillsRequired || goal.skillsRequired || [],
      skillsLearned: roadmapData.skillsLearned || goal.skillsLearned || [],
      status: 'not_started',
      isAIGenerated: true,
      aiMetadata: {
        service: (aiService && ['gemini', 'manual'].includes(aiService)) ? aiService : 'gemini',
        model: aiModel || 'unknown',
        generatedAt: new Date(),
        prompt: `Generated for goal: ${goal.name}`
      },
      moderationStatus: 'approved', // Auto-approve, can change to 'pending'
      isPublic: false
    });

    // Create activity log
    await Activity.createActivity({
      userId: req.user.id,
      type: 'roadmap_started',
      title: `Started AI-generated roadmap: ${roadmapData.title}`,
      description: `New ${roadmap.difficulty} level roadmap created with AI assistance`,
      metadata: {
        roadmapId: roadmap._id,
        goalId: goalId,
        isAIGenerated: true,
        aiService
      },
      icon: 'sparkles',
      color: 'purple'
    });

    res.status(201).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Error saving AI roadmap:', error);

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

// @desc    Get user's AI generation stats
// @route   GET /api/ai/user-stats
// @access  Private
exports.getUserAIStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count AI-generated roadmaps
    const aiRoadmapsCount = await Roadmap.countDocuments({
      userId,
      isAIGenerated: true
    });

    // Count user-submitted goals
    const userGoalsCount = await Goal.countDocuments({
      createdBy: userId,
      isUserSubmitted: true
    });

    // Get rate limit info
    const rateLimitCheck = checkRateLimit(userId, 10, 3600000);

    res.status(200).json({
      success: true,
      data: {
        aiRoadmapsGenerated: aiRoadmapsCount,
        userGoalsSubmitted: userGoalsCount,
        rateLimit: {
          remaining: rateLimitCheck.remaining,
          resetAt: rateLimitCheck.resetAt
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user AI stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Admin functions

// @desc    Get all AI-generated roadmaps (admin)
// @route   GET /api/ai/admin/roadmaps
// @access  Admin
exports.getAllAIRoadmaps = async (req, res) => {
  try {
    const { 
      moderationStatus, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = { isAIGenerated: true };

    if (moderationStatus && moderationStatus !== 'all') {
      query.moderationStatus = moderationStatus;
    }

    const roadmaps = await Roadmap.find(query)
      .populate('goalId', 'name category')
      .populate('userId', 'name email')
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Roadmap.countDocuments(query);

    res.status(200).json({
      success: true,
      count: roadmaps.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: roadmaps
    });
  } catch (error) {
    console.error('Error fetching AI roadmaps:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all user-submitted goals (admin)
// @route   GET /api/ai/admin/user-goals
// @access  Admin
exports.getAllUserGoals = async (req, res) => {
  try {
    const { 
      moderationStatus, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = { isUserSubmitted: true };

    if (moderationStatus && moderationStatus !== 'all') {
      query.moderationStatus = moderationStatus;
    }

    const goals = await Goal.find(query)
      .populate('createdBy', 'name email')
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Goal.countDocuments(query);

    res.status(200).json({
      success: true,
      count: goals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: goals
    });
  } catch (error) {
    console.error('Error fetching user goals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Moderate a roadmap (admin)
// @route   PUT /api/ai/admin/moderate-roadmap/:id
// @access  Admin
exports.moderateRoadmap = async (req, res) => {
  try {
    const { moderationStatus, moderationNotes } = req.body;

    if (!['approved', 'rejected', 'flagged', 'pending'].includes(moderationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation status'
      });
    }

    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus,
        moderationNotes,
        moderatedBy: req.user.id,
        moderatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Error moderating roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Moderate a goal (admin)
// @route   PUT /api/ai/admin/moderate-goal/:id
// @access  Admin
exports.moderateGoal = async (req, res) => {
  try {
    const { moderationStatus, moderationNotes } = req.body;

    if (!['approved', 'rejected', 'flagged', 'pending'].includes(moderationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation status'
      });
    }

    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus,
        moderationNotes,
        moderatedBy: req.user.id,
        moderatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error moderating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = exports;

