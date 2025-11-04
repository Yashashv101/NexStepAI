const Roadmap = require('../models/Roadmap');
const Goal = require('../models/Goal');
const UserProgress = require('../models/UserProgress');
const Activity = require('../models/Activity');

// @desc    Get all roadmaps
// @route   GET /api/roadmaps
// @access  Public
exports.getRoadmaps = async (req, res) => {
  try {
    const { 
      goalId, 
      category, 
      difficulty, 
      search, 
      isPublic, 
      isTemplate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    let query = {};
    
    if (goalId) {
      query.goalId = goalId;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }
    
    if (isTemplate !== undefined) {
      query.isTemplate = isTemplate === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Execute query with pagination
    const roadmaps = await Roadmap.find(query)
      .populate('goalId', 'name category')
      .populate('userId', 'name')
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
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single roadmap
// @route   GET /api/roadmaps/:id
// @access  Public
exports.getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .populate('goalId', 'name category description')
      .populate('userId', 'name')
      .populate('steps.resources');
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }
    
    // Get user progress if user is authenticated
    let userProgress = null;
    if (req.user) {
      userProgress = await UserProgress.findOne({
        userId: req.user.id,
        roadmapId: roadmap._id
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        roadmap,
        userProgress
      }
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new roadmap
// @route   POST /api/roadmaps
// @access  Private
exports.createRoadmap = async (req, res) => {
  try {
    const {
      title,
      description,
      goalId,
      difficulty,
      estimatedDuration,
      category,
      steps,
      tags,
      skillsRequired,
      skillsLearned,
      isPublic,
      isTemplate
    } = req.body;

    // Validate required fields
    if (!title || !goalId || !difficulty || !estimatedDuration || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, goalId, difficulty, estimatedDuration, and category'
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

    // Add order to steps if not provided
    const orderedSteps = steps.map((step, index) => ({
      ...step,
      order: step.order || index + 1
    }));

    const roadmap = await Roadmap.create({
      title,
      description,
      goalId,
      userId: req.user ? req.user.id : null,
      difficulty,
      estimatedDuration,
      category,
      steps: orderedSteps,
      tags: tags || [],
      skillsRequired: skillsRequired || [],
      skillsLearned: skillsLearned || [],
      isPublic: isPublic || false,
      isTemplate: isTemplate || false
    });

    // Create activity log if user is authenticated
    if (req.user) {
      await Activity.createActivity({
        userId: req.user.id,
        type: 'roadmap_started',
        title: `Created roadmap: ${title}`,
        description: `New ${difficulty} level roadmap for ${goal.name}`,
        metadata: {
          roadmapId: roadmap._id,
          goalId: goalId
        },
        icon: 'map',
        color: 'blue'
      });
    }

    res.status(201).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Error creating roadmap:', error);
    
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

// @desc    Update roadmap
// @route   PUT /api/roadmaps/:id
// @access  Private
exports.updateRoadmap = async (req, res) => {
  try {
    let roadmap = await Roadmap.findById(req.params.id);
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }
    
    // Check if user owns the roadmap or is admin
    if (req.user && roadmap.userId && (roadmap.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this roadmap'
      });
    }
    
    roadmap = await Roadmap.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Error updating roadmap:', error);
    
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

// @desc    Delete roadmap
// @route   DELETE /api/roadmaps/:id
// @access  Private
exports.deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }
    
    // Check if user owns the roadmap or is admin
    if (req.user && roadmap.userId && (roadmap.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this roadmap'
      });
    }
    
    await Roadmap.findByIdAndDelete(req.params.id);
    
    // Also delete associated user progress
    await UserProgress.deleteMany({ roadmapId: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Roadmap deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update step completion
// @route   PUT /api/roadmaps/:id/steps/:stepId/complete
// @access  Private
exports.updateStepCompletion = async (req, res) => {
  try {
    const { id: roadmapId, stepId } = req.params;
    const { completed, timeSpent, notes } = req.body;
    
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }
    
    // Find or create user progress
    let userProgress = await UserProgress.findOne({
      userId: req.user.id,
      roadmapId: roadmapId
    });
    
    if (!userProgress) {
      userProgress = await UserProgress.create({
        userId: req.user.id,
        roadmapId: roadmapId,
        goalId: roadmap.goalId,
        stepProgress: []
      });
    }
    
    // Update step progress
    const stepIndex = userProgress.stepProgress.findIndex(
      step => step.stepId.toString() === stepId
    );
    
    if (stepIndex >= 0) {
      userProgress.stepProgress[stepIndex].completed = completed;
      userProgress.stepProgress[stepIndex].timeSpent = timeSpent || 0;
      userProgress.stepProgress[stepIndex].notes = notes || '';
      if (completed) {
        userProgress.stepProgress[stepIndex].completedAt = new Date();
      }
    } else {
      userProgress.stepProgress.push({
        stepId: stepId,
        completed: completed,
        timeSpent: timeSpent || 0,
        notes: notes || '',
        completedAt: completed ? new Date() : null
      });
    }
    
    await userProgress.save();
    
    // Create activity log for step completion
    if (completed) {
      const step = roadmap.steps.id(stepId);
      if (step) {
        await Activity.createActivity({
          userId: req.user.id,
          type: 'step_completed',
          title: `Completed step: ${step.title}`,
          description: `Finished step in ${roadmap.title}`,
          metadata: {
            roadmapId: roadmapId,
            stepId: stepId,
            timeSpent: timeSpent
          },
          icon: 'check',
          color: 'green'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: userProgress
    });
  } catch (error) {
    console.error('Error updating step completion:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user's roadmaps
// @route   GET /api/roadmaps/user/:userId
// @access  Private
exports.getUserRoadmaps = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Check if user is requesting their own roadmaps or is admin
    if (req.user && (userId !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these roadmaps'
      });
    }
    
    let query = { userId: userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const roadmaps = await Roadmap.find(query)
      .populate('goalId', 'name category')
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
    console.error('Error fetching user roadmaps:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};