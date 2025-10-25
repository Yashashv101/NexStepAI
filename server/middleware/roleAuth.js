const roleAuth = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: ['Authentication required'] 
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ 
        success: false, 
        error: ['Access denied. Insufficient permissions.'] 
      });
    }
    
    next();
  };
};

module.exports = roleAuth;