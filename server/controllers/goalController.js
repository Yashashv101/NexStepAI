const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const Roadmap = require('../models/Roadmap');
const UserProgress = require('../models/UserProgress');
const Resource = require('../models/Resource');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Public
exports.getGoals = async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Execute query with pagination
    const goals = await Goal.find(query)
      .populate('createdBy', 'name')
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
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Public
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id).populate('createdBy', 'name');
    
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
    console.error('Error fetching goal:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      difficulty,
      estimatedTime,
      icon,
      tags,
      skillsRequired,
      skillsLearned
    } = req.body;

    // Log incoming request for debugging
    console.log('Goal creation request:', {
      userId: req.user?.id,
      userRole: req.user?.role,
      requestBody: {
        name,
        description,
        category,
        difficulty,
        estimatedTime,
        icon,
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',') : [],
        skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : typeof skillsRequired === 'string' ? skillsRequired.split(',') : [],
        skillsLearned: Array.isArray(skillsLearned) ? skillsLearned : typeof skillsLearned === 'string' ? skillsLearned.split(',') : []
      },
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!name || !description || !category || !difficulty || !estimatedTime) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!description) missingFields.push('description');
      if (!category) missingFields.push('category');
      if (!difficulty) missingFields.push('difficulty');
      if (!estimatedTime) missingFields.push('estimatedTime');
      
      console.error('Goal creation validation error:', {
        userId: req.user?.id,
        missingFields,
        providedFields: { name: !!name, description: !!description, category: !!category, difficulty: !!difficulty, estimatedTime: !!estimatedTime },
        timestamp: new Date().toISOString()
      });
      
      return res.status(400).json({
        success: false,
        message: `Please provide all required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate category against enum values
    const validCategories = [
      'Web Development',
      'Mobile Development', 
      'Data Science',
      'Machine Learning',
      'DevOps',
      'Cybersecurity',
      'UI/UX Design',
      'Game Development',
      'Blockchain',
      'Cloud Computing'
    ];
    
    if (!validCategories.includes(category)) {
      console.error('Goal creation category validation error:', {
        userId: req.user?.id,
        providedCategory: category,
        validCategories,
        timestamp: new Date().toISOString()
      });
      
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        providedCategory: category,
        validCategories
      });
    }

    const goal = await Goal.create({
      name,
      description,
      category,
      difficulty,
      estimatedTime,
      icon,
      tags: tags || [],
      skillsRequired: skillsRequired || [],
      skillsLearned: skillsLearned || [],
      createdBy: req.user.id
    });

    console.log('Goal created successfully:', {
      goalId: goal._id,
      userId: req.user.id,
      goalName: goal.name,
      category: goal.category,
      timestamp: new Date().toISOString()
    });

    // Create activity log if user is authenticated
    if (req.user) {
      await Activity.createActivity({
        userId: req.user.id,
        type: 'goal_created',
        title: `Created goal: ${name}`,
        description: `New ${difficulty} level goal in ${category}`,
        metadata: {
          goalId: goal._id
        },
        icon: 'target',
        color: 'green'
      });
    }

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    // Enhanced error logging
    console.error('Goal creation error:', {
      userId: req.user?.id,
      userRole: req.user?.role,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      const validationDetails = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = {
          message: error.errors[key].message,
          value: error.errors[key].value,
          kind: error.errors[key].kind
        };
        return acc;
      }, {});
      
      console.error('Goal validation error details:', {
        userId: req.user?.id,
        validationErrors: validationDetails,
        timestamp: new Date().toISOString()
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages,
        validationDetails
      });
    }
    
    if (error.name === 'CastError') {
      console.error('Goal creation cast error:', {
        userId: req.user?.id,
        path: error.path,
        value: error.value,
        kind: error.kind,
        timestamp: new Date().toISOString()
      });
      
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        field: error.path,
        value: error.value
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
      errorId: `goal_creation_${Date.now()}`
    });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    // Check if user owns the goal or is admin
    if (req.user && (goal.createdBy.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }
    
    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    
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

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    // Debug logging
    console.log('Delete goal request received:', {
      goalId: req.params.id,
      hasUser: !!req.user,
      userId: req.user?.id,
      userRole: req.user?.role,
      authHeader: req.headers.authorization ? 'Present' : 'Missing'
    });

    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    // Check if user is authenticated
    if (!req.user) {
      console.error('Delete attempt without authentication');
      return res.status(401).json({
        success: false,
        message: 'Authentication required to delete goals. Please log in again.'
      });
    }
    
    // Check if user owns the goal or is admin
    const goalOwnerId = goal.createdBy.toString();
    const isOwner = goalOwnerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    console.log('Authorization check:', {
      goalOwnerId,
      requestUserId: req.user.id,
      userRole: req.user.role,
      isOwner,
      isAdmin
    });
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal'
      });
    }

    // Implement cascading deletion for related records
    const goalId = req.params.id;
    
    try {
      // Delete associated roadmaps
      const deletedRoadmaps = await Roadmap.deleteMany({ goalId: goalId });
      
      // Delete associated user progress records
      const deletedProgress = await UserProgress.deleteMany({ goalId: goalId });
      
      // Delete associated resources
      const deletedResources = await Resource.deleteMany({ goalId: goalId });
      
      // Update activities to remove goalId reference (soft delete approach)
      await Activity.updateMany(
        { 'metadata.goalId': goalId },
        { $unset: { 'metadata.goalId': '' } }
      );
      
      console.log(`Cascading deletion completed for goal ${goalId}:`, {
        roadmaps: deletedRoadmaps.deletedCount,
        userProgress: deletedProgress.deletedCount,
        resources: deletedResources.deletedCount
      });
      
    } catch (cascadeError) {
      console.error('Error during cascading deletion:', cascadeError);
      return res.status(500).json({
        success: false,
        message: 'Error deleting related records',
        error: cascadeError.message
      });
    }
    
    // Hard delete the goal
    await Goal.findByIdAndDelete(req.params.id);
    
    console.log('Goal deleted successfully:', goalId);
    
    res.status(200).json({
      success: true,
      message: 'Goal and all associated records deleted successfully',
      data: {
        deletedGoalId: goalId,
        deletedGoalName: goal.name
      }
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get goal categories
// @route   GET /api/goals/categories
// @access  Public
exports.getGoalCategories = async (req, res) => {
  try {
    const categories = await Goal.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};