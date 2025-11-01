const rateLimit = require('express-rate-limit');
const { logRateLimitExceeded } = require('../utils/logger');

// Rate limiter for registration endpoints
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 registration requests per windowMs
  message: {
    success: false,
    error: ['Too many registration attempts. Please try again in 15 minutes.']
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    logRateLimitExceeded('/api/auth/register', ip, userAgent);
    res.status(429).json({
      success: false,
      error: ['Too many registration attempts. Please try again in 15 minutes.']
    });
  }
});

// Rate limiter for admin registration (more restrictive)
const adminRegistrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 admin registration attempts per hour
  message: {
    success: false,
    error: ['Too many admin registration attempts. Please try again in 1 hour.']
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    logRateLimitExceeded('/api/auth/register-admin', ip, userAgent);
    res.status(429).json({
      success: false,
      error: ['Too many admin registration attempts. Please try again in 1 hour.']
    });
  }
});

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    success: false,
    error: ['Too many login attempts. Please try again in 15 minutes.']
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    logRateLimitExceeded('/api/auth/login', ip, userAgent);
    res.status(429).json({
      success: false,
      error: ['Too many login attempts. Please try again in 15 minutes.']
    });
  }
});

module.exports = {
  registrationLimiter,
  adminRegistrationLimiter,
  loginLimiter
};