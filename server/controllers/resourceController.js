const Resource = require('../models/Resource');
const Activity = require('../models/Activity');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res) => {
  try {
    const { 
      type, 
      difficulty, 
      goalId,
      search, 
      tags,
      isActive,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (goalId) {
      query.goalId = goalId;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Execute query with pagination
    const resources = await Resource.find(query)
      .populate('goalId', 'name category')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Resource.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('goalId', 'name category description')
      .populate('createdBy', 'name');
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Log resource access if user is authenticated
    if (req.user) {
      await Activity.createActivity({
        userId: req.user.id,
        type: 'resource_accessed',
        title: `Accessed resource: ${resource.title}`,
        description: `Viewed ${resource.type} resource`,
        metadata: {
          resourceId: resource._id,
          goalId: resource.goalId
        },
        icon: 'book',
        color: 'blue'
      });
    }
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private
exports.createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      url,
      difficulty,
      estimatedTime,
      tags,
      skillsRequired,
      skillsLearned,
      goalId
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, type, difficulty'
      });
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      url,
      difficulty,
      estimatedTime,
      tags: tags || [],
      skillsRequired: skillsRequired || [],
      skillsLearned: skillsLearned || [],
      goalId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    
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

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if user owns the resource or is admin
    if (resource.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }
    
    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    
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

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if user owns the resource or is admin
    if (resource.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }
    
    // Soft delete by setting isActive to false
    await Resource.findByIdAndUpdate(req.params.id, { isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Rate resource
// @route   PUT /api/resources/:id/rate
// @access  Private
exports.rateResource = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }
    
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Calculate new average rating
    const newCount = resource.rating.count + 1;
    const newAverage = ((resource.rating.average * resource.rating.count) + rating) / newCount;
    
    resource.rating.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal place
    resource.rating.count = newCount;
    
    await resource.save();
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error rating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get resource types
// @route   GET /api/resources/types
// @access  Public
exports.getResourceTypes = async (req, res) => {
  try {
    const types = await Resource.distinct('type', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error fetching resource types:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get popular resources
// @route   GET /api/resources/popular
// @access  Public
exports.getPopularResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const resources = await Resource.find({ isActive: true })
      .populate('goalId', 'name category')
      .populate('createdBy', 'name')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit * 1);
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching popular resources:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};