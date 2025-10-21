const Goal = require('../models/Goal');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Public
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find();
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Public
exports.createGoal = async (req, res) => {
  try {
    const goal = await Goal.create(req.body);
    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};