const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: ['Please provide name, email and password']
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: ['User already exists with this email']
      });
    }

    // Create user (password will be hashed automatically by the pre-save middleware)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });
    
    console.log('User registered successfully:', { id: user._id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }

    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: ['User already exists with this email']
      });
    }

    res.status(500).json({
      success: false,
      error: ['Server error during registration']
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: ['Please provide email and password']
      });
    }

    // Check for user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: ['Invalid credentials']
      });
    }

    // Check if password matches using the model method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: ['Invalid credentials']
      });
    }
    
    console.log('User logged in successfully:', { id: user._id, email: user.email });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: ['Server error during login']
    });
  }
};

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validation
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: ['Please provide a valid role (user or admin)']
      });
    }

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: ['User not found']
      });
    }

    // Prevent admin from changing their own role to user (safety measure)
    if (req.user._id.toString() === id && role === 'user') {
      return res.status(400).json({
        success: false,
        error: ['Cannot change your own role from admin to user']
      });
    }

    // Update user role
    user.role = role;
    await user.save();

    console.log('User role updated successfully:', { id: user._id, email: user.email, newRole: role });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: ['Server error during role update']
    });
  }
};