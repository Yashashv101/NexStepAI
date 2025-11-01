const Goal = require('../models/Goal');
const Activity = require('../models/Activity');

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

    // Validate required fields
    if (!name || !description || !category || !difficulty || !estimatedTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, category, difficulty, estimatedTime'
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
    console.error('Error creating goal:', error);
    
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
    const goal = await Goal.findById(req.params.id);
    
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
        message: 'Not authorized to delete this goal'
      });
    }
    
    // Soft delete by setting isActive to false
    await Goal.findByIdAndUpdate(req.params.id, { isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
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