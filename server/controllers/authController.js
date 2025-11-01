const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  logAdminCreation,
  logAdminLogin,
  logFailedAdminLogin,
  logPasswordValidationFailure,
  logSecurity
} = require('../utils/logger');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

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

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
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

// @desc    Register admin user (protected endpoint)
// @route   POST /api/auth/register-admin
// @access  Private (Admin only)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: ['Please provide name, email and password']
      });
    }

    // Additional validation for admin email
    if (email.toLowerCase().trim() !== 'admin@nexstepai.com') {
      logSecurity('UNAUTHORIZED_ADMIN_REGISTRATION_ATTEMPT', {
        attemptedEmail: email,
        ip,
        userAgent
      });
      return res.status(400).json({
        success: false,
        error: ['Admin registration is only allowed for admin@nexstepai.com']
      });
    }

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: email.toLowerCase() });
    if (adminExists) {
      logSecurity('DUPLICATE_ADMIN_REGISTRATION_ATTEMPT', {
        email: email.toLowerCase(),
        ip,
        userAgent
      });
      return res.status(400).json({
        success: false,
        error: ['Admin user already exists']
      });
    }

    // Create admin user with explicit role assignment
    const adminUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'admin'
    });
    
    // Log admin user creation
    logAdminCreation({
      id: adminUser._id,
      email: adminUser.email,
      ip,
      userAgent
    }, 'registration_endpoint');

    // Generate JWT token
    const token = generateToken(adminUser._id, adminUser.role);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      token,
      data: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        createdAt: adminUser.createdAt
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      // Log password validation failures
      const passwordErrors = messages.filter(msg => msg.includes('password'));
      if (passwordErrors.length > 0) {
        logPasswordValidationFailure(
          req.body.email, 
          req.ip || 'unknown', 
          req.get('User-Agent') || 'unknown',
          passwordErrors
        );
      }
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: ['Admin user already exists']
      });
    }

    res.status(500).json({
      success: false,
      error: ['Server error during admin registration']
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

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
      // Log failed login attempt
      logFailedAdminLogin(email, ip, userAgent, 'user_not_found');
      return res.status(401).json({
        success: false,
        error: ['Invalid credentials']
      });
    }

    // Check if password matches using the model method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Log failed login attempt
      logFailedAdminLogin(email, ip, userAgent, 'invalid_password');
      return res.status(401).json({
        success: false,
        error: ['Invalid credentials']
      });
    }
    
    // Log successful login (with special attention to admin logins)
    if (user.role === 'admin') {
      logAdminLogin(user, ip, userAgent);
    } else {
      logSecurity('USER_LOGIN_SUCCESS', {
        userId: user._id,
        email: user.email,
        role: user.role,
        ip,
        userAgent
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
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

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};