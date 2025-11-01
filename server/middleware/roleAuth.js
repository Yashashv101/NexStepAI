// Role-based authorization middleware
const roleAuth = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: ['Access denied. Please authenticate first.']
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: [`Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`]
      });
    }

    next();
  };
};

module.exports = roleAuth;