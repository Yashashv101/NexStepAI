const Roadmap = require('../models/Roadmap');

// @desc    Get all roadmaps
// @route   GET /api/roadmaps
// @access  Public
exports.getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().populate('goalId', 'name description');
    
    res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create a roadmap
// @route   POST /api/roadmaps
// @access  Public
exports.createRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.create(req.body);
    
    res.status(201).json({
      success: true,
      data: roadmap
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